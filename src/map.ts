import { customTileLayer } from './components/CustomTileLayer';
import { MapInfo, MapInfoDetail } from './types';
import { loadMarkers } from './marker';
import { errorSpan } from './globals';
import { createShowHideButton } from './control/showHide';
import { leaflet } from './env';
import { createEditorButton, createSaveEditButton } from './control/enableEdit';
import { MapController } from './control/controller';
import { MapEvents } from './control/events';

function parseNumPair (value: string): [number, number] | undefined {
  const parts = value.split(',');
  const value1 = parseFloat(parts[0]);
  const value2 = parseFloat(parts[1]);
  if (isNaN(value1) || isNaN(value2)) {
    return undefined;
  }
  return [value1, value2];
}

function parseAttributes (element: HTMLElement) {
  const attr = element.attributes;

  const mapInfo: Partial<MapInfoDetail> = {};

  const assertAttr = <K extends keyof MapInfo>(key: K, result: () => MapInfo[K] | null | undefined) => {
    const value = result();
    if (!value) throw new Error(`地图属性缺失或格式错误: ${key}`);
    mapInfo[key] = value;
  };

  const retriveStringAttr = (name: string): string | undefined => {
    const value = attr.getNamedItem(name)?.value;
    return value ? value.trim() : undefined;
  };

  const retriveNumberAttr = (name: string): number | undefined => {
    const value = retriveStringAttr(name);
    if (!value) return undefined;
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  };

  const retriveNumPairAttr = (name: string): [number, number] | undefined => {
    const value = attr.getNamedItem(name)?.value;
    if (!value) return undefined;
    return parseNumPair(value);
  };

  assertAttr('tileTemplate', () => retriveStringAttr('data-tile-template'));
  assertAttr('tileBaseZoom', () => retriveNumberAttr('data-tile-base-zoom'));
  mapInfo.tileSize = retriveNumPairAttr('data-tile-size') || [256, 256];

  assertAttr('bounds', () => retriveNumPairAttr('data-bounds'));
  mapInfo.zoomRange = retriveNumPairAttr('data-zoom-range');

  mapInfo.markerSource =
    retriveStringAttr('data-marker') ||
    `Data:${(() => {
      const idx = mapInfo.tileTemplate.lastIndexOf('.');
      if (idx === -1) {
        return mapInfo.tileTemplate;
      } else {
        return mapInfo.tileTemplate.substring(0, idx);
      }
    })()}.json`;

  mapInfo.initLoc = (() => {
    const value = retriveStringAttr('data-init-loc');
    if (!value) return undefined;
    const pair = parseNumPair(value);
    if (pair) {
      return pair;
    }
    return value;
  })();

  mapInfo.initZoom = retriveNumberAttr('data-init-zoom');

  const scale = Math.pow(2, mapInfo.tileBaseZoom);

  mapInfo.point2coord = point => {
    return leaflet().latLng(-point.y / scale, point.x / scale);
  };

  mapInfo.coord2point = coord => {
    const x = coord.lng * scale;
    const y = -coord.lat * scale;
    return { x, y };
  };

  return mapInfo as MapInfoDetail;
}

export async function initMap (element: HTMLElement) {
  if (!element.id || element.tagName !== 'DIV') {
    element.innerHTML = '';
    element.append(errorSpan('地图的id或标签设置有误！'));
    return;
  }
  const L = leaflet();

  console.log(`初始化地图: ${element.id}`);

  const mapInfo = parseAttributes(element);

  const bounds = L.latLngBounds(
    mapInfo.point2coord({ x: 0, y: mapInfo.bounds[1] }),
    mapInfo.point2coord({ x: mapInfo.bounds[0], y: 0 })
  );

  console.log(`地图边界: ${bounds.toBBoxString()}`);

  const tileLayer = customTileLayer({
    tileSize: L.point(mapInfo.tileSize),
    minZoom: mapInfo.zoomRange?.[0],
    maxZoom: mapInfo.zoomRange?.[1],
    bounds,
    tilePattern: mapInfo.tileTemplate,
  });

  const events = new MapEvents(mapInfo);

  const map = L.map(element, {
    crs: L.CRS.Simple,
    maxBounds: bounds,
    contextmenu: true,
    contextmenuItems: [
      {
        text: '<i class="fa fa-plus-circle" aria-hidden="true"/>&ensp;添加标记',
        callback: function (event) {
          const point = mapInfo.coord2point(event.latlng);
          events.emit('newMarker', point);
        },
      },
    ],
  });

  tileLayer.addTo(map);

  map.fitBounds(bounds);

  if (Array.isArray(mapInfo.initLoc) && mapInfo.initLoc.length === 2) {
    map.setView(mapInfo.point2coord({ x: mapInfo.initLoc[0], y: mapInfo.initLoc[1] }), mapInfo.initZoom);
  }

  const { markerLoc, markersWithInfo } = await loadMarkers(map, events);

  const control = new MapController(markersWithInfo, map, events);

  events.emit('showMarkers');

  if (markerLoc) {
    console.log(`设置地图初始位置: ${mapInfo.initLoc} - ${markerLoc} - Zoom=${mapInfo.initZoom}`);
    map.setView(markerLoc, mapInfo.initZoom);
  }

  createShowHideButton(map, events).addTo(map);
  createEditorButton(map, events).addTo(map);
  control.setSaveButton(createSaveEditButton(map, events));
}
