/// <reference types="leaflet" />
/// <reference types="leaflet-easybutton" />
/// <reference types="leaflet-contextmenu" />

type LeafletInstance = typeof window.L;

let _L: LeafletInstance | undefined;

/**
 * 设置 Leaflet 实例
 * @param leaflet Leaflet 库实例
 * @returns 无返回值，将实例保存到模块内部变量
 */
export function setLeafletInstance (leaflet: LeafletInstance) {
  _L = leaflet;
}

/**
 * 获取 Leaflet 实例
 * @returns Leaflet 库实例
 * @throws 如果实例未设置则可能出现运行时错误
 */
export function leaflet () {
  return _L as LeafletInstance;
}
