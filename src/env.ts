/// <reference types="leaflet" />
/// <reference types="leaflet-easybutton" />
/// <reference types="leaflet-contextmenu" />

type LeafletInstance = typeof window.L;

let _L: LeafletInstance | undefined;

export function setLeafletInstance (leaflet: LeafletInstance) {
  _L = leaflet;
}

export function leaflet () {
  return _L as LeafletInstance;
}
