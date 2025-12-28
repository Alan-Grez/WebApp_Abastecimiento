import mapboxgl from 'mapbox-gl';
import React, { useEffect, useRef } from 'react';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface MapCanvasProps {
  center: [number, number];
  onReady?: (map: mapboxgl.Map) => void;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({ center, onReady }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center,
      zoom: 15,
      pitch: 45,
    });
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.ScaleControl());
    mapRef.current = map;
    onReady?.(map);
    return () => {
      map.remove();
    };
  }, [center, onReady]);

  return <div className="map-container" ref={mapContainer} />;
};
