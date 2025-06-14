import type { LatLng, Marker, MarkerOptions } from 'leaflet';
import { IconService } from './services/IconService';
import { escapeInput } from './globals';
import { Coordinates, MapInfo, MapInfoDetail, MarkerInfo } from './types';
import { ApiService } from './services/ApiService';

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
      return mapInfo.mapPoint(marker.coords);
    }
  }
  return undefined;
}

export async function loadMarkers (map: ReturnType<typeof L.map>, mapInfo: MapInfoDetail) {
  const rawMarkers = await fetchMarkerData(mapInfo);
  const markerLoc = pickMarkerLoc(rawMarkers, mapInfo);
  const markers = rawMarkers.map(marker => createMarker(marker, mapInfo));
  return { markerLoc, markers };
}

export function createMarker (markerInfo: MarkerInfo, mapInfo: MapInfoDetail): Marker {
  const loc = mapInfo.mapPoint(markerInfo.coords);
  const marker = L.marker(loc, {
    // draggable: true,
    icon: IconService.getDefaultIcon(),
    contextmenu: true,
    contextmenuInheritItems: false,
    contextmenuItems: [
      {
        text: '<i class="fa fa-pencil-square" aria-hidden="true"></i>&ensp;编辑标记',
        callback: function (event) {
          this.mapMarkerEditor.loadMarker(event.relatedTarget);
          this.mapMarkerEditor.show();
        },
      },
      {
        text: '<i class="fa fa-trash" aria-hidden="true"></i>&ensp;删除标记',
        callback: function (event) {
          this.removeMarker(this, this.mapInfo, event.relatedTarget);
          this.mapInfo.needSave = true;
          this.saveButton.enable();
        },
      },
    ],
  } as MarkerOptions) as Marker;

  marker.bindPopup(escapeInput(markerInfo.tooltip));

  return marker;
}
