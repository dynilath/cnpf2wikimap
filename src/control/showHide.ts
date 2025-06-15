import { MapInfoDetail } from '../types';
import { leaflet } from '../env';
import type { Map } from 'leaflet';
import { MapEvents } from './events';

export function createShowHideButton (map: Map, events: MapEvents) {
  return leaflet().easyButton({
    position: 'topleft',
    states: [
      {
        stateName: 'set-hide',
        icon: 'fa fa-eye',
        title: '隐藏标记',
        onClick: (btn: any) => {
          events.emit('hideMarkers');
          btn.state('set-show');
        },
      },
      {
        stateName: 'set-show',
        icon: 'fa fa-eye-slash',
        title: '显示标记',
        onClick: (btn: any) => {
          events.emit('showMarkers');
          btn.state('set-hide');
        },
      },
    ],
  });
}
