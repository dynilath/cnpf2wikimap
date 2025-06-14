declare const L: typeof import('leaflet');

declare global {
  $: JQueryStatic;
  jQuery: JQueryStatic;
  mw: typeof import('types-mediawiki/mw');
}

declare const __MAP_CLASS__: string;