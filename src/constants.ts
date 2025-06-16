// CSS 类名和属性名常量
export const CSS_CLASSES = {
  MAP: __MAP_CLASS__,
} as const;

// 默认图标配置
export const DEFAULT_ICON_CONFIG = {
  iconUrl: 'https://huiji-public.huijistatic.com/warframe/uploads/7/7a/Marker-icon.png',
  iconSize: [15, 24.6] as [number, number],
  iconAnchor: [7.5, 24.6] as [number, number],
  popupAnchor: [0, -24.6] as [number, number],
  tooltipAnchor: [7.5, -18] as [number, number],
} as const;

// API 相关常量
export const API_CONFIG = {
  ENDPOINT: '/api.php',
  TIMEOUT: 10000,
  IMAGE_INFO_PROPS: 'url|dimensions',
  REVISION_PROPS: 'content',
  REVISION_LIMIT: '1',
} as const;

export const VISUAL = {
  ICON_SIZE: 50,
};
