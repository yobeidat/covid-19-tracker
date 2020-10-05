
import React, { useEffect, useRef,useState } from 'react';
import { loadModules } from 'esri-loader';
import './WebMapView.css';
import countriesLayer from './custom.geojson';
export const WebMapView = ({ countryCode, countryInfo }) => {
  const mapRef = useRef();
  const [mView, setmView] = useState(null);
  const [gjLayer, setgjLayer] = useState(null);
  useEffect(
    () => {
      // lazy load the required ArcGIS API for JavaScript modules and CSS
      loadModules(['esri/Map', 'esri/views/MapView', 'esri/layers/GeoJSONLayer',"esri/Graphic"], { css: true })
        .then(([ArcGISMap, MapView, GeoJSONLayer,Graphic]) => {

          const renderer = {
            type: "simple",
            symbol: {
              type: "simple-fill",
              outline: { color: [206, 44, 44, 1] },
              color: [255, 255, 255, 0.25]
            }
          };

          const geojsonLayer = new GeoJSONLayer({
            url: countriesLayer,
            //popupTemplate: template,
            renderer: renderer //optional
          });
          setgjLayer(geojsonLayer);
          const map = new ArcGISMap({
            basemap: 'topo-vector',
            layers: [geojsonLayer]
          });

          // load the map view at the ref's DOM node
          const view = new MapView({
            container: mapRef.current,
            map: map,
            center: [-118, 34],
            zoom: 8
          });
          setmView(view);
          //view.center = center;
          if (countryCode !== "worldwide") {
            var query = geojsonLayer.createQuery();
            query.where = "iso_a2 = '" + countryCode+"'";
            geojsonLayer.queryFeatures(query).then(result => {
              console.log(result);
              const fillSymbol = {
                type: "simple-fill",
                outline: { style: "none" },
                color: [197, 114, 114, 0.25]
              };
              
              const countryGarphic = new Graphic({
                geometry: result.features[0].geometry,
                symbol: fillSymbol
              });          
              view.graphics.removeAll();    
              view.graphics.add(countryGarphic);
              view.goTo({
                target: countryGarphic
              },{duration:1000});
            });
          }

          return () => {
            if (view) {
              // destroy the map view
              view.container = null;
            }
          };
        });
    },[]
  );

  useEffect(
    () => {
      // lazy load the required ArcGIS API for JavaScript modules and CSS
      loadModules(["esri/Graphic"], { css: true })
        .then(([Graphic]) => {
          if (countryCode !== "worldwide") {
            var query = gjLayer.createQuery();
            query.where = "iso_a2 = '" + countryCode+"'";
            gjLayer.queryFeatures(query).then(result => {
              console.log(result);
              const fillSymbol = {
                type: "simple-fill",
                outline: { style: "none" },
                color: [197, 114, 114, 0.25]
              };
              
              const countryGarphic = new Graphic({
                geometry: result.features[0].geometry,
                symbol: fillSymbol
              });          
              mView.graphics.removeAll();    
              mView.graphics.add(countryGarphic);
              mView.goTo({
                target: countryGarphic
              },{duration:1000});
            });
          }
        });
    },[countryCode]
  );

  return <div className="webMapView" ref={mapRef} />;
};