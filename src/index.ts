import { initMap } from './map';
import { waitForLeaflet } from './globals';

console.log('Loading interactive map module.');

waitForLeaflet()
  .then(() => {
    const mapElements = document.querySelectorAll(__MAP_CLASS__);
    for (const element of mapElements) {
      if (element instanceof HTMLElement) {
        initMap(element);
      }
    }
  })
  .catch(error => {
    console.error('加载时出错:', error);
  });
