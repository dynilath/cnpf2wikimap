import type { LatLng } from 'leaflet';

// 坐标接口
export interface Coordinates {
  x: number;
  y: number;
}

// 地图信息接口
export interface MapInfo {
  tileTemplate: string;
  tileSize: [number, number];
  tileBaseZoom: number;

  bounds?: [number, number];
  zoomRange?: [number, number];

  markerSource: string;

  initLoc?: [number, number] | string;
  initZoom?: number;
}

// 地图信息详细接口，包含地图坐标转换方法
export interface MapInfoDetail extends MapInfo {
  mapPoint: (coords: Coordinates) => LatLng;
}

export interface MarkerInfo {
  coords: Coordinates;
  tag: string;
  tooltip?: string;
  markerImage?: string;
}

// API 查询数据接口
export interface ApiQueryData {
  action: string;
  format: string;
  [key: string]: any;
}
export interface ShowHideControl {
  showMarkers?: () => void;
  hideMarkers?: () => void;
}
