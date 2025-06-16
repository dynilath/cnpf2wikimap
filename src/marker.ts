import type { LatLng, Map, Marker, MarkerOptions } from 'leaflet';
import { IconService } from './services/IconService';
import { escapeInput } from './globals';
import { MarkerWithInfo, MapInfo, MapInfoDetail, MarkerInfo } from './types';
import { ApiService } from './services/ApiService';
import { leaflet } from './env';
import { MapEvents } from './control/events';

/**
 * 验证数据是否为有效的标记信息
 * @param data 需要验证的数据对象
 * @returns 如果数据符合 MarkerInfo 格式返回 true，否则返回 false
 */
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

/**
 * 从 API 获取标记数据
 * @param mapInfo 地图信息对象，包含标记数据源
 * @returns Promise，解析为标记信息数组，获取失败时返回空数组
 */
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

/**
 * 根据初始位置配置选择标记位置
 * @param markers 标记信息数组
 * @param mapInfo 地图详细信息，包含初始位置配置
 * @returns 找到匹配标记时返回其坐标，否则返回 undefined
 */
function pickMarkerLoc (markers: MarkerInfo[], mapInfo: MapInfoDetail): LatLng | undefined {
  if (typeof mapInfo.initLoc === 'string') {
    const marker = markers.find(m => m.tag === mapInfo.initLoc);
    if (marker) {
      return mapInfo.point2coord(marker.coords);
    }
  }
  return undefined;
}

/**
 * 加载并创建地图标记
 * @param map Leaflet 地图实例
 * @param events 地图事件处理器，包含地图信息和事件方法
 * @returns 无返回值，直接在地图上添加标记并设置视图
 */
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

/**
 * 更新已存在的标记信息和位置
 * @param old 原有的标记对象（包含标记实例和信息）
 * @param updated 更新后的标记信息
 * @param mapInfo 地图详细信息，用于坐标转换
 * @returns 无返回值，直接更新传入的标记对象
 */
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
    old.info.tooltip = updated.tooltip;
  }

  old.info.tag = updated.tag;
}

/**
 * 创建新的地图标记
 * @param info 标记信息，包含坐标、标签、提示文本等
 * @param events 地图事件处理器，用于坐标转换和事件绑定
 * @returns 包含 Leaflet 标记实例和信息的组合对象
 */
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
          events.emit('editMarker', marker);
        },
      },
      {
        text: '<i class="fa fa-trash" aria-hidden="true"/>&ensp;删除标记',
        callback: e => {
          events.emit('removeMarker', marker);
        },
      },
    ],
  } as MarkerOptions) as Marker;

  marker.on('dragend', e => {
    const coord = events.info.coord2point((e.target as Marker).getLatLng());
    events.emit('dragMarker', { marker, coord });
  });

  IconService.getMarkerIcon(info).then(icon => {
    marker.setIcon(icon);
  });

  marker.bindPopup(escapeInput(info.tooltip));

  return { marker, info };
}
