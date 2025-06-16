import { setLeafletInstance } from './env';
import { waitForLeaflet } from './globals';
import { initMap } from './map';

console.log('初始化交互式地图模块...');

/**
 * 初始化交互式地图模块
 * 等待 Leaflet 加载完成后，查找并初始化页面中的所有地图元素
 */
(async () => {
  try {
    // 等待 Leaflet 库加载完成
    await waitForLeaflet();

    // 设置 Leaflet 实例
    setLeafletInstance(window.L);

    // 查找页面中的所有地图元素
    const mapElements = document.querySelectorAll(__MAP_CLASS__);
    const loadedSet = new Set<string>();

    // 遍历并初始化每个地图元素
    mapElements.forEach(element => {
      if (element instanceof HTMLElement && element.id && !loadedSet.has(element.id)) {
        loadedSet.add(element.id);
        initMap(element);
      }
    });
  } catch (error) {
    console.error('加载 Leaflet 失败:', error);
  }
})();
