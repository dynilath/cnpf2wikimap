import { leaflet } from '../env';
import type { Map } from 'leaflet';
import { MapEvents } from './events';

/**
 * 创建显示/隐藏标记的切换按钮
 * @param map Leaflet 地图实例
 * @param events 地图事件处理器，用于触发显示/隐藏事件
 * @returns Leaflet EasyButton 实例，具有两种状态：显示和隐藏
 */
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
