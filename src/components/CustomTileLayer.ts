import type { TileLayerOptions, Coords } from 'leaflet';
import { huijiImageURL } from '../services/huijiStatic';

export interface CustomTileLayerOptions extends TileLayerOptions {
  tilePattern?: string;
}

let _clazz: ReturnType<typeof initClass> | undefined;

/**
 * 初始化自定义瓦片图层类
 * @param L Leaflet 库实例
 * @returns 自定义瓦片图层类，支持使用灰机 Wiki 静态资源的瓦片模式
 */
export function initClass (L: typeof window.L) {
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

/**
 * 创建自定义瓦片图层实例
 * @param options 瓦片图层选项，包含瓦片模式等配置
 * @returns 自定义瓦片图层实例
 *
 * 这个函数确保只有在 Leaflet 完全加载后才创建类定义
 */
export function customTileLayer (options?: CustomTileLayerOptions) {
  if (!_clazz) {
    _clazz = initClass(window.L);
  }
  return new _clazz(options);
}
