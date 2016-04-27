(function() {
  'use strict';

  class Map {
    constructor(mapId, minZoom, maxZoom) {
      this.mapId        = mapId;
      this.minZoom      = minZoom;
      this.maxZoom      = maxZoom;
      this.lMap         = null;
      this.lMapPolyline = null;
      this.trackColor   = null;
      this.mapLayer     = null;
      this.gpxFile      = null;
    }

    cleanTrack() {
      this.lMap.removeLayer(this.lMapPolyline);
    }

    cleanMap() {
      if (this.lMapPolyline !== null) {
        this.cleanTrack();
      }
      this.lMap.remove();
    }

    updateTrack() {
      this.cleanTrack();
      this.displayTrack();
    }

    updateMap() {
      this.cleanMap();
      this.display();
    }

    display() {
      document.getElementById('gpx-display-form-res').style.display = 'none';
      this.displayMap();
      this.displayTrack();
    }

    displayMap() {
      this.lMap = new L.Map(this.mapId);

      let osmUrl    = this.mapLayer;
      let osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
      let osm = new L.TileLayer(osmUrl, {
        minZoom:     this.minZoom,
        maxZoom:     this.maxZoom,
        attribution: osmAttrib
      }).addTo(this.lMap);

      document.getElementById('page-title').style.display = 'none';
      document.getElementById('body').style.height        = '100vh';
      document.getElementById(this.mapId).style.display   = 'block';
    }

    displayTrack() {
      let reader = new FileReader();
      reader.map = this;

      reader.addEventListener('load', function(eLoad) {
        let map = eLoad.target.map.lMap;

        let polylineOptions = {
          color: eLoad.target.map.trackColor
        };

        eLoad.target.map.lMapPolyline = new L.GPX(this.result, {
          async: true,
          polyline_options: polylineOptions,
          marker_options: {
            startIconUrl: 'lib/leaflet-gpx/pin-icon-start.png',
            endIconUrl:   'lib/leaflet-gpx/pin-icon-end.png',
            shadowUrl:    'lib/leaflet-gpx/pin-shadow.png'
          }
        });

        eLoad.target.map.lMapPolyline.on('loaded', function(e) {
          eLoad.target.map.lMap.fitBounds(e.target.getBounds());

          // Display table with results.
          let gpxFormAndres = document.getElementById('gpx-display-form-res');
          let tdDistance    = document.getElementById('gpx-distance');
          let tdStart       = document.getElementById('gpx-start');
          let tdEnd         = document.getElementById('gpx-end');
          let tdDuration    = document.getElementById('gpx-duration');
          let tdSpeed       = document.getElementById('gpx-speed');
          let startTime     = e.target.get_start_time();
          let endTime       = e.target.get_end_time();

          tdDistance.textContent = `${(e.target.get_distance() / 1000).toFixed(1)} km`;
          tdStart.textContent    = `${startTime.toLocaleDateString()}, ${startTime.toLocaleTimeString()}`;
          tdEnd.textContent      = `${endTime.toLocaleDateString()}, ${endTime.toLocaleTimeString()}`;
          tdDuration.textContent = `${e.target.get_duration_string(e.target.get_total_time())}`;
          tdSpeed.textContent    = `${e.target.get_total_speed().toFixed(1)} km/h`;

          document.getElementById('gpx-res').style.display = 'table';

          gpxFormAndres.style.position    = 'fixed';
          gpxFormAndres.style.top         = '6px';
          gpxFormAndres.style.right       = '6px';
          gpxFormAndres.style.borderWidth = '1px';
          gpxFormAndres.style.padding     = '5px';
          gpxFormAndres.style.boxShadow   = '2px 2px 5px 0px grey';
          gpxFormAndres.style.display     = 'block';
          gpxFormAndres.style.textAlign   = 'left';

        }).addTo(eLoad.target.map.lMap);
      });

      document.getElementById('gpx-file-name').textContent = this.gpxFile.name;
      reader.readAsDataURL(this.gpxFile);
    }
  }


  const MIN_ZOOM = 9;
  const MAX_ZOOM = 16;

  let map = new Map('map', MIN_ZOOM, MAX_ZOOM);

  let inputFile  = document.getElementById('file');
  let trackColor = document.getElementById('track-color');
  let mapLayer   = document.getElementById('map-layer');
  inputFile.map  = map;
  trackColor.map = map;
  mapLayer.map   = map;


  // GPX file.
  inputFile.addEventListener('change', function(e) {
    e.target.map.gpxFile    = inputFile.files[0];
    e.target.map.mapLayer   = document.getElementById('map-layer').value;
    e.target.map.trackColor = document.getElementById('track-color').value;

    if (e.target.map.lMap !== null) {
      e.target.map.cleanMap();
    }

    e.target.map.display();
  });


  // Track color.
  trackColor.addEventListener('change', function(e) {
    e.target.map.trackColor = trackColor.value;

    if (e.target.map.gpxFile !== null) {
      e.target.map.updateTrack();
    }
  });


  // Map layer.
  mapLayer.addEventListener('change', function(e) {
    e.target.map.mapLayer = mapLayer.value;

    if (e.target.map.gpxFile !== null) {
      e.target.map.updateMap();
    }
  });


  // Hide/display button.
  document.getElementById('hide-or-display').addEventListener('click', function() {
    let info  = document.getElementById('gpx-display-form-res');

    if (info.style.right === '6px') {
      info.style.right = `-${info.offsetWidth}px`;
      this.textContent = '<';
    } else {
      info.style.right = '6px';
      this.textContent = '>';
    }
  });
}());
