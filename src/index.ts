import { initMap } from './map';
import { waitForLeaflet } from './globals';

console.log('Loading interactive map module.');

const loadedSet = new Set<string>();

waitForLeaflet()
  .then(() => {
    const mapElements = document.querySelectorAll(__MAP_CLASS__);
    mapElements.forEach(element => {
      if (element instanceof HTMLElement && element.id && !loadedSet.has(element.id)) {
        loadedSet.add(element.id);
        initMap(element);
      }
    });
  })
  .catch(error => {
    console.error('加载时出错:', error);
  });
