import React, { useState, useRef, useMemo } from 'react';

import { supabase } from './supabaseClient';

import './FeedbackForm.css';

import { useTranslation } from 'react-i18next';





export const CATEGORY_KEYS = [

  'category_roads',

  'category_lighting',

  'category_garbage',

  'category_buildings',

  'category_greenery',

  'category_other'

];



const fileToBase64 = (file: File): Promise<string> =>

  new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {



      const base64String = (reader.result as string).split(',')[1];

      resolve(base64String);

    };

    reader.onerror = (error) => reject(error);

  });





const normalize = (s?: string) =>

  (s || '').toString().trim().toLowerCase().replace(/ё/g, 'е');



interface LocationState { lat: number; lng: number }



const FeedbackForm: React.FC = () => {


  const { t, i18n } = useTranslation();



  const [title, setTitle] = useState('');

  const [description, setDescription] = useState('');

  // Используем ключ категории

  const [categoryKey, setCategoryKey] = useState<string>(CATEGORY_KEYS[0]);

  const [location, setLocation] = useState<LocationState | null>(null);

  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState('');

  const [priority, setPriority] = useState<number>(1);

  const [isAnalyzing, setIsAnalyzing] = useState(false);



  const fileInputRef = useRef<HTMLInputElement>(null);





  const localizedCategories = useMemo(() => {

    return CATEGORY_KEYS.map(key => ({

      key: key,

      label: t(key),

    }));

  }, [t]);







  const handleGetLocation = () => {

    setMessage(t('getting_location') || 'Получение геолокации...');

    if (!navigator.geolocation) {

      setMessage(t('geolocation_not_supported') || 'Ваш браузер не поддерживает геолокацию.');

      return;

    }

    navigator.geolocation.getCurrentPosition(

      (pos) => {

        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };

        setLocation(coords);

        setMessage(t('location_received') || 'Геолокация получена');

      },

      (err) => {

        console.error('Geolocation error', err);

        setMessage(t('geolocation_error') || 'Ошибка получения геолокации.');

      },

      { enableHighAccuracy: true, timeout: 10000 }

    );

  };





  const handleFileChangeAndAnalyze = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const selectedFile = e.target.files ? e.target.files[0] : null;

    if (!selectedFile) return;



    setFile(selectedFile);

    setIsAnalyzing(true);

    setMessage(t('analyzing_image') || '🤖 Анализирую изображение (это может занять до 15 секунд)...');





    setTitle('');

    setDescription('');

    setPriority(1);

    setCategoryKey(CATEGORY_KEYS[0]);



    try {

      const imageBase64 = await fileToBase64(selectedFile);





      const invokeOptions = {

        body: {

          imageBase64,

          language: i18n.language

        },

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

      };



      const { data: rawData, error } = await supabase.functions.invoke('analyze-image', invokeOptions);



      if (error) {

        throw new Error(error.message || 'Function invocation error');

      }



      let aiData: any = rawData;



      try {

        if (typeof rawData === 'string') {

          aiData = JSON.parse(rawData);

        } else if (rawData && (rawData as any).body && typeof (rawData as any).body === 'string') {

          aiData = JSON.parse((rawData as any).body);

        }

      } catch (parseErr) {

        console.warn('Не удалось распарсить ответ AI как JSON:', parseErr);

      }



      if (aiData && aiData.error) {

        throw new Error(aiData.error);

      }



      const aiTitle = aiData?.title ?? '';

      const aiDescription = aiData?.description ?? '';

      const aiCategory = aiData?.category ?? '';

      const aiPriorityRaw = aiData?.priority ?? aiData?.severity ?? 1;



      setTitle(aiTitle);

      setDescription(aiDescription);




      const parsedPriority = parseInt(aiPriorityRaw as any, 10);

      setPriority((!isNaN(parsedPriority) && parsedPriority >= 1 && parsedPriority <= 3) ? parsedPriority : 1);





      const normalizedAiCat = normalize(aiCategory);





      let foundCategoryKey = localizedCategories.find((item) =>

        normalize(item.label) === normalizedAiCat || normalize(item.label).includes(normalizedAiCat)

      )?.key;



      setCategoryKey(foundCategoryKey || 'category_other');



      setMessage(t('ai_fill_success') || '✅ AI успешно заполнил поля. Проверьте и отправьте.');



    } catch (err: unknown) {

      console.error('Ошибка анализа AI:', err);

      const errorMessage = err instanceof Error ? err.message : String(err);

      setMessage(t('ai_error', { error: errorMessage }) || `❌ Ошибка анализа AI: ${errorMessage}. Пожалуйста, заполните поля вручную.`);

    } finally {

      setIsAnalyzing(false);

    }

  };





  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();



    if (!location) { setMessage(t('location_required') || 'Локация обязательна!'); return; }

    if (!title || !description) { setMessage(t('fill_required') || 'Заполните обязательные поля.'); return; }

    if (loading || isAnalyzing) return;



    setLoading(true);

    setMessage(t('submitting') || 'Отправка обращения...');



    try {

      let photoUrl = '';



      if (file) {

        const fileExt = file.name.split('.').pop();

        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

        const filePath = `public/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('appeal_photos').upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('appeal_photos').getPublicUrl(filePath);

        photoUrl = publicUrlData.publicUrl;

      }





      const { data, error: insertError } = await supabase.from('appeals').insert({

        title,

        description,

        category: t(categoryKey),

        lat: location.lat,

        lng: location.lng,

        photo_url: photoUrl,

        status: t('status_received') || 'Получено',

        priority,

      }).select();



      if (insertError) throw insertError;



      const appealId = data?.[0]?.id;

      setMessage(t('success_message', { id: appealId }) || `✅ Обращение отправлено. ID: ${appealId}`);





      setTitle(''); setDescription(''); setLocation(null); setFile(null); setPriority(1);

      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (err) {

      console.error(err);

      setMessage(t('error_message') || '❌ Ошибка при отправке обращения. Проверьте консоль.');

    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="feedback-form-container" style={{ opacity: isAnalyzing ? 0.7 : 1 }}>

      <h2>{t('form_header') || 'Подача жалобы или предложения'}</h2>

      {message && <p className="message">{message}</p>}



      {isAnalyzing && (

        <div className="ai-loader">

          <h3>🤖 {t('analyzing') || 'Идет анализ изображения...'}</h3>

        </div>

      )}



      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Фото */}

        <div>

          <label style={{ display: 'block', marginBottom: 8 }}>{t('form_photo') || 'Фото'}:</label>

          <input

            type="file"

            accept="image/*"

            onChange={handleFileChangeAndAnalyze}

            ref={fileInputRef}

            disabled={isAnalyzing || loading}

          />

        </div>



        {/* Категория */}

        <div>

          <label style={{ display: 'block', marginBottom: 8 }}>{t('form_category') || 'Категория'}:</label>

          <select value={categoryKey} onChange={(e) => setCategoryKey(e.target.value)} required disabled={isAnalyzing || loading}>

            {localizedCategories.map((item) => (

              <option key={item.key} value={item.key}>{item.label}</option>

            ))}

          </select>

        </div>



        {/* Заголовок */}

        <div>

          <label style={{ display: 'block', marginBottom: 8 }}>{t('form_title') || 'Заголовок'}:</label>

          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={isAnalyzing || loading} />

        </div>



        {/* Описание */}

        <div>

          <label style={{ display: 'block', marginBottom: 8 }}>{t('form_description') || 'Описание'}:</label>

          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required disabled={isAnalyzing || loading}></textarea>

        </div>



        {/* Приоритет */}

        <div>

          <label style={{ display: 'block', marginBottom: 8 }}>{t('form_priority') || 'Уровень проблемы (AI):'}</label>

          <input

            type="text"

            value={t('form_priority_full', { level: priority }) || `Уровень ${priority} (1=Низкий, 3=Высокий)`}

            disabled

            readOnly

          />

        </div>



        {/* Локация */}

        <div className="location-box">

          <label>{t('form_location') || 'Локация'}</label>

          <button type="button" onClick={handleGetLocation} disabled={loading || isAnalyzing}>

            {t('form_get_location') || 'Получить текущую локацию'}

          </button>

          {location && <p>📍 {t('form_location_success') || 'Получено'} Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}</p>}

          {!location && <p style={{ color: 'red' }}>{t('form_location_required') || 'Локация обязательна!'}</p>}

        </div>



        {/* Кнопка отправки */}

        <button type="submit" disabled={!location || loading || isAnalyzing || !title || !description}>

          {loading ? (t('loading') || 'Отправка...') : (t('submit_button') || 'Отправить обращение')}

        </button>

      </form>

    </div>

  );

};



export default FeedbackForm;