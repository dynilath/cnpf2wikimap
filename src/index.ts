import { setLeafletInstance } from './env';
import { waitForLeaflet } from './globals';
import { initMap } from './map';

console.log('Loading interactive map module.');

const loadedSet = new Set<string>();

waitForLeaflet()
  .then(() => {
    setLeafletInstance(window.L);
  })
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
    console.error('Error initializing interactive map:', error);
  });
