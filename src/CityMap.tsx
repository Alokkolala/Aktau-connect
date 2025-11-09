
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { supabase } from './supabaseClient';
import { useTranslation } from 'react-i18next';
import { type MapPoint } from './types';
import L from 'leaflet';


import 'leaflet/dist/leaflet.css';
import './citymap.css';





const AKTAU_CENTER: [number, number] = [43.6558, 51.1714];
const INITIAL_ZOOM = 13;


const MapFix: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(t);
  }, [map]);
  return null;
};


const createCustomIcon = (type: string) => {
  let className = 'custom-marker-icon ';
  if (type === 'событие') className += 'marker-событие';
  else if (type === 'место') className += 'marker-место';
  else className += 'marker-инициатива';

  return L.divIcon({
    className,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const CityMap: React.FC = () => {
  const { t } = useTranslation();
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'Все' | 'событие' | 'место' | 'инициатива'>('Все');

  useEffect(() => {
    fetchMapPoints();
  }, []);

  const fetchMapPoints = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('map_points').select('*').returns<MapPoint[]>();
    if (!error && data) setPoints(data);
    setLoading(false);
  };

  const filteredPoints = points.filter((p) => filter === 'Все' || p.type === filter);

  const getFilterTranslation = (key: string) => {
    if (key === 'Все') return t('filter_all');
    if (key === 'событие') return t('filter_event');
    if (key === 'место') return t('filter_place');
    if (key === 'инициатива') return t('filter_initiative');
    return key;
  };

  return (
    <div className="map-section">
      <h3 className="map-title">{t('map_header')}</h3>

      <div className="type-filters">
        {(['Все', 'событие', 'место', 'инициатива'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`filter-btn ${f === filter ? 'active' : ''}`}
          >
            {getFilterTranslation(f)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="loading-text">{t('loading')}</p>
      ) : (
        <div className="map-wrapper">
          <MapContainer
            center={AKTAU_CENTER}
            zoom={INITIAL_ZOOM}
            scrollWheelZoom
            className="map-container"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            <MapFix />

            {filteredPoints.map((point) => (
              <Marker key={point.id} position={[point.lat, point.lng]} icon={createCustomIcon(point.type)}>
                <Popup>
                  <h3>{point.name}</h3>
                  <p>{t('filter_type')}: <strong>{point.type}</strong></p>
                  <p>{point.description}</p>
                  <p>{t('map_coords')}: {point.lat.toFixed(4)}, {point.lng.toFixed(4)}</p>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default CityMap;

