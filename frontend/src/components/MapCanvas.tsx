import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect, useMemo, useRef } from 'react';
import { trackError } from '../lib/errorTracking';

// Token público de Mapbox para entornos de pruebas. Sustituye este valor usando
// la variable VITE_MAPBOX_TOKEN en producción.
const accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface MapCanvasProps {
  center: [number, number];
  onReady?: (map: mapboxgl.Map) => void;
}



export const MapCanvas: React.FC<MapCanvasProps> = ({ center, onReady }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const tokenMissing = useMemo(() => !accessToken, []);

  useEffect(() => {
    if (tokenMissing || mapRef.current || !mapContainer.current) return;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center,
      zoom: 15,
      pitch: 45,
    });
    map.on('error', (event) => {
      trackError(event.error || new Error('Error en Mapbox'), { source: 'mapbox' });
    });
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.ScaleControl());
    mapRef.current = map;
    onReady?.(map);
    return () => {
      map.remove();
    };
  }, [center, onReady, tokenMissing]);

  return (
    <div className="map-container" ref={mapContainer}>
      {tokenMissing && (
        <div className="map-token-warning">
          <p>Falta la variable VITE_MAPBOX_TOKEN.</p>
          <p>Agrega un token público de Mapbox en el archivo .env.local y reinicia Vite.</p>
        </div>
      )}
    </div>
  );
};
