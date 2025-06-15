import type { LatLng, Marker } from 'leaflet';

// 坐标接口
export interface Point {
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
  point2coord: (point: Point) => LatLng;
  coord2point: (coord: LatLng) => Point;
}

export interface MarkerInfo {
  coords: Point;
  tag?: string;
  tooltip?: string;
  markerImage?: string;
}

export interface MarkerWithInfo {
  marker: Marker;
  info: MarkerInfo;
}

// API 查询数据接口
export interface ApiQueryData {
  action: string;
  format: string;
  [key: string]: any;
}
