import { type TileLayerOptions, type Coords } from 'leaflet';
import { huijiImageURL } from '../services/huijiStatic';
import { waitForLeaflet } from '../globals';

export interface CustomTileLayerOptions extends TileLayerOptions {
  tilePattern?: string;
}

let clazz: ReturnType<typeof createCustomTileLayerClass> | undefined;

function createCustomTileLayerClass () {
  return class CustomTileLayer extends L.TileLayer {
    tilePattern: string;

    constructor (options?: CustomTileLayerOptions) {
      super('', options);
      this.tilePattern = options?.tilePattern ?? 'Tiles-$x-$y-$z.png';
    }

    override getTileUrl (coords: Coords) {
      const x = coords.x;
      const y = coords.y;
      const z = this._getZoomForUrl();
      const subst: { [key: string]: number } = { $x: x, $y: y, $z: z };

      const fileName = this.tilePattern.replace(/\$x|\$y|\$z/g, (m: string) => {
        return `${subst[m]}`;
      });

      return huijiImageURL(fileName);
    }
  };
}

waitForLeaflet().then(() => {
  clazz = createCustomTileLayerClass();
});

/**
 * 创建自定义瓦片图层类
 * 这个函数确保只有在 Leaflet 完全加载后才创建类定义
 */
export function customTileLayer (options?: CustomTileLayerOptions) {
  if (!clazz) {
    throw new Error(
      'Leaflet is not loaded yet. Please ensure Leaflet is available before creating a custom tile layer.'
    );
  }
  return new clazz(options);
}
