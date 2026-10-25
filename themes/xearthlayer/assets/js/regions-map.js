/*
 * Regions map on the packages page. Draws one shape per scenery region over
 * Esri light or dark gray canvas tiles, with hover tooltips, click to zoom, and links to
 * the region table and legend. Needs Leaflet (window.L) loaded before it.
 * If anything is missing the coverage PNG inside the container stays visible.
 */
(function () {
  'use strict';

  var ESRI_ATTRIBUTION = 'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, DeLorme, NAVTEQ';

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function init() {
    var el = document.getElementById('regions-map');
    if (!el || !window.L) return;

    var regions;
    try {
      regions = JSON.parse(el.dataset.regions || '{}');
    } catch (err) {
      console.warn('regions-map: bad region data', err);
      return;
    }

    var map = L.map(el, { worldCopyJump: true, minZoom: 1, maxZoom: 8 });
    map.setView([20, 10], 2);
    map.setMaxBounds([[-85, -540], [85, 540]]);

    var lightQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
    function tileUrl() {
      var style = lightQuery && lightQuery.matches ? 'World_Light_Gray_Base' : 'World_Dark_Gray_Base';
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/' + style + '/MapServer/tile/{z}/{y}/{x}';
    }
    var base = L.tileLayer(tileUrl(), { maxZoom: 8, attribution: ESRI_ATTRIBUTION }).addTo(map);
    if (lightQuery && lightQuery.addEventListener) {
      lightQuery.addEventListener('change', function () { base.setUrl(tileUrl()); });
    }

    var layersByCode = {};
    var activeRow = null;

    function isStaging(code) { return regions[code].status === 'staging'; }

    function baseStyle(code) {
      var color = regions[code].color;
      var staging = isStaging(code);
      return {
        color: color,
        fillColor: color,
        weight: 1,
        opacity: 0.9,
        fillOpacity: staging ? 0.2 : 0.35,
        dashArray: staging ? '4 3' : null
      };
    }

    function hoverStyle(code) {
      var s = baseStyle(code);
      s.weight = 2;
      s.fillOpacity += 0.25;
      return s;
    }

    function tooltipHtml(code) {
      var r = regions[code];
      var parts = ['<code>' + escapeHtml(code) + '</code>'];
      if (typeof r.download === 'string' && r.download) parts.push(escapeHtml(r.download));
      if (isStaging(code)) parts.push('Staging');
      return '<strong>' + escapeHtml(r.name) + '</strong><br>' + parts.join(' · ');
    }

    function highlightRow(code) {
      if (activeRow) activeRow.classList.remove('is-active');
      activeRow = document.querySelector('.regions-table tr[data-region="' + code + '"]');
      if (activeRow) activeRow.classList.add('is-active');
    }

    function focusRegion(code) {
      var layer = layersByCode[code];
      if (!layer) return;
      map.fitBounds(layer.getBounds(), { padding: [20, 20] });
      highlightRow(code);
    }

    function linkTableAndLegend() {
      var table = document.querySelector('.regions-table');
      if (table) table.classList.add('regions-table--linked');
      var nodes = document.querySelectorAll('.regions-table tr[data-region], .regions-legend li[data-region]');
      Array.prototype.forEach.call(nodes, function (node) {
        node.addEventListener('click', function () {
          focusRegion(node.dataset.region);
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      });
    }

    fetch(el.dataset.geojson)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + el.dataset.geojson);
        return res.json();
      })
      .then(function (geojson) {
        var drawn = 0;
        L.geoJSON(geojson, {
          filter: function (f) { return !!(f.properties && regions[f.properties.code]); },
          style: function (f) { return baseStyle(f.properties.code); },
          onEachFeature: function (f, layer) {
            var code = f.properties.code;
            layersByCode[code] = layer;
            drawn += 1;
            layer.bindTooltip(tooltipHtml(code), { sticky: true, className: 'regions-map__tooltip' });
            layer.on({
              mouseover: function () { layer.setStyle(hoverStyle(code)); layer.bringToFront(); },
              mouseout: function () { layer.setStyle(baseStyle(code)); },
              click: function () { focusRegion(code); }
            });
          }
        }).addTo(map);
        if (drawn === 0) {
          console.warn('regions-map: no regions matched the page data');
          map.remove();
          return;
        }
        el.classList.add('is-ready');
        linkTableAndLegend();
      })
      .catch(function (err) {
        el.classList.remove('is-ready');
        console.warn('regions-map: regions not drawn', err);
        map.remove();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
