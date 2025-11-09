import React, { useState } from 'react';

import FeedbackForm from './FeedbackForm'; 

import CityMap from './CityMap'; 

import EventSubmissionForm from './EventSubmissionForm'; // Убедитесь, что файл существует!



import { useTranslation } from 'react-i18next';

import { Map, Send, LayoutList, Award, User, Globe, Plus } from 'lucide-react'; 

import './App.css';







const Logo: React.FC = () => (

  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">

   <circle cx="20" cy="20" r="20" fill="#5865f2"/>

    <path d="M12 20C12 24.4183 15.5817 28 20 28C24.4183 28 28 24.4183 28 20C28 15.5817 24.4183 12 20 12C15.5817 12 12 15.5817 12 20Z" fill="white" fillOpacity="0.2"/>

    <path d="M16 20C16 22.2091 17.7909 24 20 24C22.2091 24 24 22.2091 24 20C24 17.7909 22.2091 16 20 16C17.7909 16 16 17.7909 16 20Z" fill="white"/>

  </svg>

);



function App() {

  const { t, i18n } = useTranslation(); 

  const [currentView, setCurrentView] = useState<'map' | 'form' | 'submit'>('map'); 



  const changeLanguage = (lng: string) => {

    i18n.changeLanguage(lng);

  };



  return (

    <div className="app-layout">

      {/* 1. Левый Сайдбар (Навигация) */}

      <nav className="sidebar">

        <div>

          <div className="sidebar-logo">

            <Logo />

            <h1>

              {t('app_title', 'Aktau Connect')}&nbsp;

              <span>{t('app_subtitle', 'smart city')}</span>

            </h1>

          </div>

          

          <div className="sidebar-nav">

            {/* Карта */}

            <a 

              href="#"

              className={currentView === 'map' ? 'active' : ''}

              onClick={() => setCurrentView('map')}

            >

              <Map size={20} />

              {t('nav_map')}

            </a>

            

            {/* Жалобы */}

            <a 

              href="#"

              className={currentView === 'form' ? 'active' : ''}

              onClick={() => setCurrentView('form')}

            >

              <Send size={20} />

              {t('nav_form')}

            </a>



                {/* Добавить событие */}

                <a 

                    href="#"

                    className={currentView === 'submit' ? 'active' : ''}

                    onClick={() => setCurrentView('submit')}

                >

                    <Plus size={20} />

                    {t('event_form_header', 'Добавить событие')}

                </a>

            

            {/* Заглушки */}

            <a href="#" style={{ opacity: 0.5, pointerEvents: 'none' }}>

              <LayoutList size={20} />

              {t('nav_events', 'Оқиғалар')}

            </a>

            <a href="#" style={{ opacity: 0.5, pointerEvents: 'none' }}>

              <Award size={20} />

              {t('nav_awards', 'Марапаттар')}

            </a>

            <a href="#" style={{ opacity: 0.5, pointerEvents: 'none' }}>

              <User size={20} />

              {t('nav_profile', 'Профиль')}

            </a>

          </div>

        </div>



        {/* Переключатель языка */}

        <div className="language-switcher">

          <button 

            onClick={() => changeLanguage('ru')}

            className={i18n.language === 'ru' ? 'active' : ''}

          >

            {t('lang_rus', 'РУС')}

          </button>

          /

          <button 

            onClick={() => changeLanguage('kz')}

            className={i18n.language === 'kz' ? 'active' : ''}

          >

            {t('lang_kaz', 'ҚАЗ')}

          </button>

        </div>

      </nav>



      {/* 2. Центральный контент */}

      <main className="main-content">

        {currentView === 'map' && <CityMap />}

        {currentView === 'form' && <FeedbackForm />}

        {currentView === 'submit' && <EventSubmissionForm />}

      </main>



      {/* 3. Правая Инфо-Панель (как на референсе) */}

      <aside className="details-panel">

        <div className="details-panel-placeholder">

          <Globe size={60} />

          <h4>{t('map_details_placeholder_title', 'Выберите маркер')}</h4>

          <p>{t('map_details_placeholder_desc', 'Выберите маркер на карте, чтобы увидеть детали события.')}</p>

        </div>

      </aside>

    </div>

  );

}

export default App;