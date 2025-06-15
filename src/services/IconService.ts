import { MarkerInfo } from '../types';
import { ApiService } from './ApiService';
import { DEFAULT_ICON_CONFIG, VISUAL } from '../constants';
import type { Icon } from 'leaflet';
import { leaflet } from '../env';

let _defaultIcon: Icon | undefined;

function createDefaultIcon (): Icon {
  if (_defaultIcon) {
    return _defaultIcon;
  }
  const L = leaflet();
  _defaultIcon = L.icon(DEFAULT_ICON_CONFIG);
  return _defaultIcon;
}

interface IconEntry {
  filename: string;
  url: string;
  width: number;
  height: number;
  icon: Icon;
}

const iconDict: Map<string, IconEntry> = new Map();

/**
 * 图标管理服务
 */
export class IconService {
  /**
   * 获取默认图标
   */
  static getDefaultIcon () {
    return createDefaultIcon();
  }

  /**
   * 获取标记图标
   *
   * 如果标记信息中没有指定图标，则返回默认图标。
   * @param markerInfo 标记信息
   * @returns 返回一个 Promise，解析为标记图标
   */
  static async getMarkerIcon (markerInfo: MarkerInfo): Promise<Icon> {
    if (!markerInfo.markerImage) {
      return this.getDefaultIcon();
    }

    const iconInfo = iconDict.get(markerInfo.markerImage);
    if (iconInfo) {
      return iconInfo.icon;
    }

    const data = await ApiService.getImageInfo(markerInfo.markerImage);
    const pages = data.query?.pages;
    if (!pages || pages.length === 0) {
      return this.getDefaultIcon();
    }

    for (const page of pages) {
      if (page.missing) {
        return this.getDefaultIcon();
      }

      if (page.imageinfo?.[0]) {
        const imageInfo = page.imageinfo[0];

        const width = imageInfo.width;
        const height = imageInfo.height;

        const ratio = VISUAL.ICON_SIZE / Math.max(width, height);

        const icon = leaflet().icon({
          iconUrl: imageInfo.url,
          iconSize: [width * ratio, height * ratio],
          iconAnchor: [(width / 2) * ratio, (height / 2) * ratio],
          popupAnchor: [0, (-height / 2) * ratio],
          tooltipAnchor: [(width / 2) * ratio, 0],
        });

        const iconInfo: IconEntry = {
          filename: markerInfo.markerImage,
          url: imageInfo.url,
          width,
          height,
          icon,
        };

        iconDict.set(markerInfo.markerImage, iconInfo);

        return iconInfo.icon;
      }
    }

    return this.getDefaultIcon();
  }
}
