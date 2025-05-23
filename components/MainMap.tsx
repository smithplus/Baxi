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
import { fromLonLat } from 'ol/proj.js'; 
import { getDistance } from 'ol/sphere.js'; 
import Style from 'ol/style/Style.js';
import Stroke from 'ol/style/Stroke.js';
import Fill from 'ol/style/Fill.js';
import CircleStyle from 'ol/style/Circle.js';
import Text from 'ol/style/Text.js';


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
          style: (feature) => feature.get('styleOverride') || feature.getStyle()
        }),
      ],
      view: new View({
        center: fromLonLat([BUENOS_AIRES_CENTER.lng, BUENOS_AIRES_CENTER.lat]),
        zoom: 12, // Slightly increased default zoom
      }),
      controls: [],
    });
    olMapRef.current = map;
    
    const handleResize = () => map.updateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      map.setTarget(undefined);
      olMapRef.current = null;
    };
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

    if (origin && destination) {
      try {
        const originCoordsForDistance = [origin.coordinates.lng, origin.coordinates.lat];
        const destinationCoordsForDistance = [destination.coordinates.lng, destination.coordinates.lat];
        
        const distanceInMeters = getDistance(originCoordsForDistance, destinationCoordsForDistance);
        
        onRouteCalculated({
          distanceMeters: distanceInMeters,
          durationSeconds: 0,
        });

        const line = new Feature(
          new LineString([
            fromLonLat(originCoordsForDistance),
            fromLonLat(destinationCoordsForDistance),
          ])
        );
        line.setStyle(new Style({
          stroke: new Stroke({
            color: '#F59E0B', 
            width: 3, // Slightly thinner line
          }),
        }));
        vectorSource.addFeature(line);

         if (extentToFit && extentToFit.length === 2 && featuresToAdd.length === 2) { 
            const firstPointGeom = featuresToAdd[0].getGeometry() as Point;
            const secondPointGeom = featuresToAdd[1].getGeometry() as Point;
            if (firstPointGeom && secondPointGeom) {
                const firstPointCoords = firstPointGeom.getCoordinates();
                const secondPointCoords = secondPointGeom.getCoordinates();
                extentToFit[0] = Math.min(firstPointCoords[0], secondPointCoords[0]);
                extentToFit[1] = Math.min(firstPointCoords[1], secondPointCoords[1]);
                extentToFit[2] = Math.max(firstPointCoords[0], secondPointCoords[0]);
                extentToFit[3] = Math.max(firstPointCoords[1], secondPointCoords[1]);
            }
        }
      } catch (error) {
        console.error("Error calculating distance or drawing route:", error);
        onRouteCalculationError("Error al calcular la distancia.");
        onRouteCalculated(null);
      }
    } else {
      onRouteCalculated(null); // Clear route if origin or dest is removed
    }

    if (extentToFit && extentToFit.length === 4) {
        // Ensure extent has valid numbers before fitting
        if (extentToFit.every(coord => typeof coord === 'number' && isFinite(coord))) {
            map.getView().fit(extentToFit, { padding: [70, 50, 70, 50], duration: 600, maxZoom: 16 });
        }
    } else if (extentToFit && extentToFit.length === 2) { // Only one point selected
      map.getView().animate({ center: extentToFit, zoom: 14, duration: 600 });
    } else if (!origin && !destination) { // No points, reset view
       map.getView().animate({ center: fromLonLat([BUENOS_AIRES_CENTER.lng, BUENOS_AIRES_CENTER.lat]), zoom: 12, duration: 600 });
    }

  }, [origin, destination, onRouteCalculated, onRouteCalculationError]);

  // Use Tailwind classes for full height and width
  return <div ref={mapRef} className="w-full h-full" role="application" aria-label="Mapa interactivo para seleccionar origen y destino"></div>;
};

export default OpenLayersMap;
