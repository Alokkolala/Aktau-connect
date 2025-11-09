import React, { useState } from 'react';
import { supabase } from './supabaseClient.ts'; 
import { useTranslation } from 'react-i18next';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';


const formStyles: React.CSSProperties = {
  padding: '20px',
  background: 'var(--bg-panels)',
  borderRadius: '12px',
  border: '1px solid var(--border-color)',
  maxWidth: '800px',
  margin: '0 auto',
};

const EventSubmissionForm: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [session, setSession] = useState<any>(null);


  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'событие' | 'место' | 'инициатива'>('событие');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');



  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);
  
 
  const handleGetLocation = () => {
   
    setMessage('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setMessage(t('form_location_success'));
          setMessageType('success');
        },
        (error) => {
          console.error(error);
          setMessage(t('form_location_error'));
          setMessageType('error');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !name || !description || loading) return;

    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase
        .from('map_points')
        .insert({
          name,
          description,
          type,
          lat: location.lat,
          lng: location.lng,
        
        })
        .select();

      if (error) throw error;

      setMessage(t('event_success_message'));
      setMessageType('success');
      
    
      setName('');
      setDescription('');
      setLocation(null);

    } catch (error) {
      console.error('Ошибка добавления события:', error);
      setMessage(t('event_error_message'));
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };



  if (!session) {
    return (
      <div style={formStyles}>
        <h3 style={{ color: 'var(--color-accent)', marginTop: 0 }}>{t('auth_required_title')}</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{t('auth_required_desc')}</p>
        <div style={{ marginTop: '20px' }}>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="dark"
            providers={['google', 'github']} 
            redirectTo={window.location.origin}
            localization={{
              variables: {
                sign_in: { email_label: t('auth_email'), password_label: t('auth_password') },
                
              }
            }}
       
          />
        </div>
      </div>
    );
  }



  return (
    <div style={formStyles}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--text-primary)', marginTop: 0 }}>{t('event_form_header')}</h3>
        <button 
          onClick={() => supabase.auth.signOut()}
          style={{ 
            background: 'var(--border-color)', 
            color: 'var(--text-primary)', 
            padding: '8px 15px', 
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {t('auth_logout')}
        </button>
      </div>

      <p style={{ color: 'var(--text-secondary)' }}>{t('event_form_desc')} ({session.user?.email})</p>
      
      {/* Сообщения */}
      {message && (
        <p style={{ 
          marginTop: '15px', 
          fontWeight: 'bold', 
          padding: '10px', 
          borderRadius: '8px', 
          color: messageType === 'success' ? '#40c057' : '#f03e3e',
          background: messageType === 'success' ? 'rgba(64, 192, 87, 0.1)' : 'rgba(240, 62, 62, 0.1)'
        }}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>{t('event_name')}:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>{t('event_type')}:</label>
          <select value={type} onChange={(e) => setType(e.target.value as 'событие' | 'место' | 'инициатива')} required style={{ width: '100%', padding: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', boxSizing: 'border-box' }}>
            <option value="событие">{t('filter_event')}</option>
            <option value="место">{t('filter_place')}</option>
            <option value="инициатива">{t('filter_initiative')}</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>{t('event_description')}:</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required style={{ width: '100%', padding: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', minHeight: '100px', resize: 'vertical', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>{t('form_location')}:</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              type="button" 
              onClick={handleGetLocation} 
              disabled={loading} 
              style={{ 
                padding: '12px 20px', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px',
                background: 'var(--bg-panels)',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              {t('form_get_location')}
            </button>
            {location ? (
                <span style={{ color: '#40c057' }}>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
            ) : (
                <span style={{ color: 'var(--text-secondary)' }}>{t('form_location_required')}</span>
            )}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={!location || loading || !name || !description} 
          style={{ 
            padding: '12px 20px', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontWeight: 'bold',
            backgroundColor: 'var(--color-accent)', 
            color: 'white',
            opacity: (!location || loading || !name || !description) ? 0.6 : 1
          }}
        >
          {loading ? t('loading') : t('event_submit_button')}
        </button>
      </form>
    </div>
  );
};


export default EventSubmissionForm;
