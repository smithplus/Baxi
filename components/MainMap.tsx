import React, { useState, useEffect, useRef, useCallback } from 'react';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import OSM from 'ol/source/OSM.js';
import VectorSource from 'ol/source/Vector.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import LineString from 'ol/geom/LineString.js';
import { fromLonLat, toLonLat } from 'ol/proj.js';
import { getDistance } from 'ol/sphere.js'; 
import Style from 'ol/style/Style.js';
import Stroke from 'ol/style/Stroke.js';
import Fill from 'ol/style/Fill.js';
import CircleStyle from 'ol/style/Circle.js';
import Text from 'ol/style/Text.js';
import { FeatureLike } from 'ol/Feature.js';

import { PlaceResult, RouteDetails } from '@/types';
import { BUENOS_AIRES_CENTER } from '@/constants';

interface OpenLayersMapProps {
  origin: PlaceResult | null;
  destination: PlaceResult | null;
  onRouteCalculated: (details: RouteDetails | null) => void;
  onRouteCalculationError: (error: string) => void;
}

// Removed mapContainerStyle, map will now use 100% height/width of its parent

const OpenLayersMap: React.FC<OpenLayersMapProps> = ({ origin, destination, onRouteCalculated, onRouteCalculationError }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const olMapRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const currentRouteFeatureRef = useRef<Feature | null>(null);

  useEffect(() => {
    if (!mapRef.current || olMapRef.current) return;

    const initialVectorSource = new VectorSource();
    vectorSourceRef.current = initialVectorSource;

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new VectorLayer({
          source: initialVectorSource,
          style: (feature: FeatureLike) => {
            const olFeature = feature as Feature;
            return olFeature.get('styleOverride') || olFeature.getStyle();
          }
        }),
      ],
      view: new View({
        center: fromLonLat([BUENOS_AIRES_CENTER.lng, BUENOS_AIRES_CENTER.lat]),
        zoom: 12, // Slightly increased default zoom
      }),
      controls: [],
    });
    olMapRef.current = map;
    
    const handleResize = () => {
      if (olMapRef.current) {
        olMapRef.current.updateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (olMapRef.current) {
        olMapRef.current.setTarget(undefined);
        olMapRef.current = null;
      }
    };
  }, []);

  const fetchRouteFromOSRM = useCallback(async (originCoords: {lng: number, lat: number}, destCoords: {lng: number, lat: number}) => {
    const url = `http://router.project-osrm.org/route/v1/driving/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}?overview=full&geometries=geojson`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `OSRM request failed with status ${response.status}`);
      }
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceInMeters = route.distance;
        const durationInSeconds = route.duration;
        
        const routeCoordinates = route.geometry.coordinates.map((coord: [number, number]) => fromLonLat(coord));
        
        return {
          distanceMeters: distanceInMeters,
          durationSeconds: durationInSeconds,
          geometry: routeCoordinates,
        };
      } else {
        throw new Error("No route found by OSRM.");
      }
    } catch (error) {
      console.error("Error fetching route from OSRM:", error);
      throw error;
    }
  }, []);

  useEffect(() => {
    const map = olMapRef.current;
    const vectorSource = vectorSourceRef.current;
    if (!map || !vectorSource) return;

    vectorSource.clear();

    let extentToFit: number[] | undefined = undefined;
    const featuresToAdd: Feature[] = [];

    const createMarkerStyle = (label: 'A' | 'B'): Style => {
      return new Style({
        image: new CircleStyle({
          radius: 10, // Slightly smaller for a cleaner look
          fill: new Fill({
            color: '#FBBF24', // Primary yellow (amber-400)
          }),
          stroke: new Stroke({
            color: '#1F2937', // Secondary dark (slate-800) for border
            width: 1.5,
          }),
        }),
        text: new Text({
          text: label,
          font: 'bold 11px "Helvetica Neue", Arial, sans-serif',
          fill: new Fill({
            color: '#1F2937', 
          }),
          offsetY: 0, 
        }),
      });
    };
    
    if (origin) {
      const originCoords = fromLonLat([origin.coordinates.lng, origin.coordinates.lat]);
      const originFeature = new Feature(new Point(originCoords));
      originFeature.setStyle(createMarkerStyle('A'));
      featuresToAdd.push(originFeature);
      extentToFit = originCoords.slice();
    }

    if (destination) {
      const destCoords = fromLonLat([destination.coordinates.lng, destination.coordinates.lat]);
      const destFeature = new Feature(new Point(destCoords));
      destFeature.setStyle(createMarkerStyle('B'));
      featuresToAdd.push(destFeature);
      if (extentToFit) {
        extentToFit[0] = Math.min(extentToFit[0], destCoords[0]);
        extentToFit[1] = Math.min(extentToFit[1], destCoords[1]);
        extentToFit[2] = Math.max(extentToFit[2] || destCoords[0], destCoords[0]);
        extentToFit[3] = Math.max(extentToFit[3] || destCoords[1], destCoords[1]);
      } else {
        extentToFit = destCoords.slice();
      }
    }
    
    vectorSource.addFeatures(featuresToAdd);

    if (currentRouteFeatureRef.current) {
      vectorSource.removeFeature(currentRouteFeatureRef.current);
      currentRouteFeatureRef.current = null;
    }

    if (origin && destination) {
      const originLonLat = { lng: origin.coordinates.lng, lat: origin.coordinates.lat };
      const destinationLonLat = { lng: destination.coordinates.lng, lat: destination.coordinates.lat };

      fetchRouteFromOSRM(originLonLat, destinationLonLat)
        .then(routeDetailsOSRM => {
          if (routeDetailsOSRM) {
            onRouteCalculated({
              distanceMeters: routeDetailsOSRM.distanceMeters,
              durationSeconds: routeDetailsOSRM.durationSeconds,
            });

            const routeFeature = new Feature(new LineString(routeDetailsOSRM.geometry));
            routeFeature.setStyle(new Style({
              stroke: new Stroke({
                color: '#F59E0B',
                width: 4,
              }),
            }));
            vectorSource.addFeature(routeFeature);
            currentRouteFeatureRef.current = routeFeature;
            
            if (extentToFit && extentToFit.length === 4) {
                if (extentToFit.every(coord => typeof coord === 'number' && isFinite(coord))) {
                   map?.getView().fit(extentToFit, { padding: [70, 50, 70, 50], duration: 600, maxZoom: 16 });
                }
            }
          }
        })
        .catch(error => {
          console.error("Error calculating OSRM route:", error);
          onRouteCalculationError(error.message || "Error al calcular la ruta con OSRM.");
        });

    } else {
      onRouteCalculated(null);
      if (extentToFit && extentToFit.length === 4) {
         if (extentToFit.every(coord => typeof coord === 'number' && isFinite(coord))) {
             map?.getView().fit(extentToFit, { padding: [70, 50, 70, 50], duration: 600, maxZoom: 16 });
         }
      } else if (extentToFit && extentToFit.length === 2) { 
        map?.getView().animate({ center: extentToFit, zoom: 14, duration: 600 });
      } else if (!origin && !destination) { 
         map?.getView().animate({ center: fromLonLat([BUENOS_AIRES_CENTER.lng, BUENOS_AIRES_CENTER.lat]), zoom: 12, duration: 600 });
      }
    }
  }, [origin, destination, onRouteCalculated, onRouteCalculationError, fetchRouteFromOSRM]);

  // Use Tailwind classes for full height and width
  return <div ref={mapRef} className="w-full h-full" role="application" aria-label="Mapa interactivo para seleccionar origen y destino"></div>;
};

export default OpenLayersMap;
