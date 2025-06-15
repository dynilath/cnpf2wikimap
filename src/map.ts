import { customTileLayer } from './components/CustomTileLayer';
import { MapInfo, MapInfoDetail, ShowHideControl } from './types';
import { loadMarkers } from './marker';
import { errorSpan } from './globals';
import { createShowHideButton } from './controls/showHide';
import { leaflet } from './env';

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

  mapInfo.markerSource = retriveStringAttr('data-marker') || `Data:${mapInfo.tileTemplate}.json`;
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

  mapInfo.mapPoint = coords => {
    return leaflet().latLng(-coords.y / scale, coords.x / scale);
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

  // 基准瓦片的缩放级别
  const scale = Math.pow(2, mapInfo.tileBaseZoom);

  const bounds = L.latLngBounds([-mapInfo.bounds[1] / scale, 0], [0, mapInfo.bounds[0] / scale]);

  console.log(`地图边界: ${bounds.toBBoxString()}`);

  const layer = customTileLayer({
    tileSize: L.point(mapInfo.tileSize),
    minZoom: mapInfo.zoomRange?.[0],
    maxZoom: mapInfo.zoomRange?.[1],
    bounds,
    tilePattern: mapInfo.tileTemplate,
  });

  const map = L.map(element, {
    crs: L.CRS.Simple,
    maxBounds: bounds,
  });

  layer.addTo(map);

  map.fitBounds(bounds);

  if (Array.isArray(mapInfo.initLoc) && mapInfo.initLoc.length === 2) {
    map.setView(mapInfo.mapPoint({ x: mapInfo.initLoc[0], y: mapInfo.initLoc[1] }), mapInfo.initZoom);
  }

  const { markerLoc, markers } = await loadMarkers(map, mapInfo);

  const showMarkers = () => {
    for (const marker of markers) {
      marker.addTo(map);
    }
  };

  const hideMarkers = () => {
    for (const marker of markers) {
      marker.remove();
    }
  };

  showMarkers();

  if (markerLoc) {
    console.log(`设置地图初始位置: ${mapInfo.initLoc} - ${markerLoc} (${mapInfo.initZoom})`);
    map.setView(markerLoc, mapInfo.initZoom);
  }

  const showHideControl: ShowHideControl = {
    showMarkers,
    hideMarkers,
  };

  createShowHideButton(map, mapInfo, showHideControl).addTo(map);
}
