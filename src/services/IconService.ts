import { IconInfo, IconMap } from '../types';
import { ApiService } from './ApiService';
import { DEFAULT_ICON_CONFIG } from '../constants';
import { waitForLeaflet } from '../globals';

let _defaultIcon: ReturnType<typeof L.icon> | undefined;

waitForLeaflet().then(() => {
  _defaultIcon = L.icon(DEFAULT_ICON_CONFIG);
});

/**
 * 图标管理服务
 */
export class IconService {
  private static iconMap: IconMap = {};

  /**
   * 获取默认图标
   */
  static getDefaultIcon () {
    return _defaultIcon as ReturnType<typeof L.icon>;
  }

  /**
   * 预加载图标信息
   */
  static async preloadIconInfo (iconNames: string[]): Promise<void> {
    const iconsToLoad: string[] = [];

    // 标记需要加载的图标
    for (const iconName of iconNames) {
      if (iconName && typeof this.iconMap[iconName] === 'undefined') {
        this.iconMap[iconName] = 'ready';
        iconsToLoad.push(iconName);
      }
    }

    if (iconsToLoad.length === 0) {
      return;
    }

    try {
      const data = await ApiService.getImageInfo(iconsToLoad);

      const pages = data.query.pages;
      const normalized = data.query.normalized || [];
      const namePairs: { [key: string]: string } = {};

      // 处理标准化的文件名
      for (let i = 0; i < iconsToLoad.length; i++) {
        const file_name = `File:${iconsToLoad[i]}`;
        const normalizedItem = normalized.find((item: any) => item.from === file_name);
        namePairs[normalizedItem?.to ?? file_name] = iconsToLoad[i];
      }

      // 存储图标信息
      for (const page of pages) {
        if (!page.missing && page.imageinfo?.[0]) {
          const iconName = namePairs[page.title];
          const imageInfo = page.imageinfo[0];

          this.iconMap[iconName] = {
            url: imageInfo.url,
            width: imageInfo.width,
            height: imageInfo.height,
          };
        }
      }
    } catch (error) {
      console.error('预加载图标信息失败:', error);
      // 重置失败的图标为ready状态，以便稍后重试
      for (const iconName of iconsToLoad) {
        this.iconMap[iconName] = 'ready';
      }
    }
  }

  /**
   * 获取自定义图标
   */
  static async getCustomIcon (iconName: string): Promise<any> {
    if (!iconName) {
      return this.getDefaultIcon();
    }

    // 如果图标信息已经加载
    const iconInfo = this.iconMap[iconName];
    if (typeof iconInfo === 'object') {
      return this.createIconFromInfo(iconInfo);
    }

    // 如果图标还未加载，尝试加载
    try {
      const data = await ApiService.getImageInfo(iconName);
      const pages = data.query.pages;

      for (const page of pages) {
        if (page.missing) {
          return this.getDefaultIcon();
        }

        if (page.imageinfo?.[0]) {
          const imageInfo = page.imageinfo[0];
          const iconInfo: IconInfo = {
            url: imageInfo.url,
            width: imageInfo.width,
            height: imageInfo.height,
          };

          this.iconMap[iconName] = iconInfo;
          return this.createIconFromInfo(iconInfo);
        }
      }
    } catch (error) {
      console.error(`加载图标 ${iconName} 失败:`, error);
    }

    return this.getDefaultIcon();
  }

  /**
   * 根据图标信息创建 Leaflet 图标
   */
  private static createIconFromInfo (iconInfo: IconInfo): any {
    return L.icon({
      iconUrl: iconInfo.url,
      iconSize: [iconInfo.width, iconInfo.height],
      iconAnchor: [iconInfo.width / 2, iconInfo.height / 2],
      popupAnchor: [0, -iconInfo.height / 2],
      tooltipAnchor: [iconInfo.width / 2, 0],
    });
  }

  /**
   * 清除图标缓存
   */
  static clearCache (): void {
    this.iconMap = {};
  }
}
