import type { LatLng, Map, Marker, MarkerOptions } from 'leaflet';
import { IconService } from './services/IconService';
import { escapeInput } from './globals';
import { MarkerWithInfo, MapInfo, MapInfoDetail, MarkerInfo } from './types';
import { ApiService } from './services/ApiService';
import { leaflet } from './env';
import { MapEvents } from './control/events';

function validMarker (data: any): data is MarkerInfo {
  return (
    data &&
    typeof data === 'object' &&
    'coords' in data &&
    typeof data.coords === 'object' &&
    'x' in data.coords &&
    'y' in data.coords &&
    typeof data.tag === 'string' &&
    (data.tooltip === undefined || typeof data.tooltip === 'string') &&
    (data.markerImage === undefined || typeof data.markerImage === 'string')
  );
}

async function fetchMarkerData (mapInfo: MapInfo) {
  try {
    const data = await ApiService.getPageJSON(mapInfo.markerSource);
    if (!Array.isArray(data['markers'])) {
      throw new Error(`地图标记数据格式错误: ${mapInfo.markerSource}`);
    }
    const markers: MarkerInfo[] = data['markers'].filter(validMarker);
    if (markers.length === 0) {
      throw new Error(`地图标记数据为空或格式不正确: ${mapInfo.markerSource}`);
    }
    return markers;
  } catch (error) {
    console.error('获取地图标记数据失败:', error);
  }
  return [];
}

function pickMarkerLoc (markers: MarkerInfo[], mapInfo: MapInfoDetail): LatLng | undefined {
  if (typeof mapInfo.initLoc === 'string') {
    const marker = markers.find(m => m.tag === mapInfo.initLoc);
    if (marker) {
      return mapInfo.point2coord(marker.coords);
    }
  }
  return undefined;
}

export async function loadMarkers (map: Map, events: MapEvents) {
  const rawMarkers = await fetchMarkerData(events.info);
  const markerLoc = pickMarkerLoc(rawMarkers, events.info);
  const { markers, markersWithInfo } = rawMarkers.reduce(
    (pv, info) => {
      const r = createMarker(info, events);

      pv.markers.push(r.marker);
      pv.markersWithInfo.push(r);
      return pv;
    },
    { markers: [], markersWithInfo: [] } as {
      markers: Marker[];
      markersWithInfo: MarkerWithInfo[];
    }
  );

  return {
    markerLoc,
    markers,
    markersWithInfo,
  };
}

export function updateMarker (old: MarkerWithInfo, updated: MarkerInfo, mapInfo: MapInfoDetail) {
  const marker = old.marker;
  marker.setLatLng(mapInfo.point2coord(updated.coords));
  old.info.coords = updated.coords;
  if (old.info.markerImage !== updated.markerImage) {
    IconService.getMarkerIcon(updated).then(icon => {
      marker.setIcon(icon);
    });
  }
  old.info.markerImage = updated.markerImage;

  if (old.info.tooltip !== updated.tooltip) {
    marker.closePopup();
    marker.unbindPopup();
    marker.bindPopup(escapeInput(updated.tooltip));
  }

  old.info.tag = updated.tag;
}

export function createMarker (info: MarkerInfo, events: MapEvents): MarkerWithInfo {
  const loc = events.info.point2coord(info.coords);

  const marker = leaflet().marker(loc, {
    // draggable: true,
    icon: IconService.getDefaultIcon(),
    contextmenu: true,
    contextmenuInheritItems: false,
    contextmenuItems: [
      {
        text: '<i class="fa fa-pencil-square" aria-hidden="true"/>&ensp;编辑标记',
        callback: e => {
          events.emit('editMarker', { marker, info });
        },
      },
      {
        text: '<i class="fa fa-trash" aria-hidden="true"/>&ensp;删除标记',
        callback: e => {
          events.emit('removeMarker', { marker, info });
        },
      },
    ],
  } as MarkerOptions) as Marker;

  marker.on('dragend', e => {
    const newCoords = events.info.coord2point((e.target as Marker).getLatLng());
    events.emit('updateMarker', {
      old: { marker, info },
      updated: { ...info, coords: newCoords },
    });
  });

  IconService.getMarkerIcon(info).then(icon => {
    marker.setIcon(icon);
  });

  marker.bindPopup(escapeInput(info.tooltip));

  return { marker, info };
}
