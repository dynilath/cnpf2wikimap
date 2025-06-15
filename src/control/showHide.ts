import { MapInfoDetail } from '../types';
import { leaflet } from '../env';
import type { Map } from 'leaflet';
import { MapController } from '.';

export function createShowHideButton (map: Map, mapInfo: MapInfoDetail, control: MapController) {
  return leaflet().easyButton({
    position: 'topleft',
    states: [
      {
        stateName: 'set-hide',
        icon: 'fa fa-eye',
        title: '隐藏标记',
        onClick: (btn: any) => {
          control.hideMarkers();
          btn.state('set-show');
        },
      },
      {
        stateName: 'set-show',
        icon: 'fa fa-eye-slash',
        title: '显示标记',
        onClick: (btn: any) => {
          control.showMarkers();
          btn.state('set-hide');
        },
      },
    ],
  });
}
