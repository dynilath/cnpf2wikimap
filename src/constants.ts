// CSS 类名和属性名常量
export const CSS_CLASSES = {
  MAP: __MAP_CLASS__,
} as const;

// 默认图标配置
export const DEFAULT_ICON_CONFIG = {
  iconUrl: 'https://huiji-public.huijistatic.com/warframe/uploads/7/7a/Marker-icon.png',
  shadowUrl: 'https://huiji-public.huijistatic.com/warframe/uploads/d/d4/Marker-shadow.png',
  iconSize: [25, 41] as [number, number],
  shadowSize: [41, 41] as [number, number],
  iconAnchor: [12, 41] as [number, number],
  shadowAnchor: [12, 41] as [number, number],
  popupAnchor: [0, -41] as [number, number],
  tooltipAnchor: [12, -30] as [number, number],
} as const;

// API 相关常量
export const API_CONFIG = {
  ENDPOINT: '/api.php',
  TIMEOUT: 10000,
  IMAGE_INFO_PROPS: 'url|dimensions',
  REVISION_PROPS: 'content',
  REVISION_LIMIT: '1',
} as const;
