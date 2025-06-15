import type { Map } from 'leaflet';
import { MapInfoDetail } from '../types';
import { leaflet } from '../env';
import { MapEvents } from './events';

export function createSaveEditButton (map: Map, events: MapEvents) {
  return leaflet().easyButton({
    position: 'topright',
    states: [
      {
        stateName: 'save-edit',
        icon: 'fa fa-floppy-o',
        title: '保存修改',
        onClick: function (btn: L.Control.EasyButton, map: L.Map): void {
          events.emit('saveEdit');
        },
      },
    ],
  });
}

export function createEditorButton (map: Map, events: MapEvents) {
  return leaflet().easyButton({
    position: 'topright',
    states: [
      {
        stateName: 'default',
        icon: 'fa fa-pencil-square-o',
        title: '启用编辑模式',
        onClick: function (btn: L.Control.EasyButton, map: L.Map): void {
          events.emit('enableEdit');
          btn.state('close-edit');
        },
      },
      {
        stateName: 'close-edit',
        icon: 'fa fa-times-circle',
        title: '关闭编辑模式',
        onClick: function (btn: L.Control.EasyButton, map: L.Map): void {
          events.emit('disableEdit');
          btn.state('default');
        },
      },
    ],
  });
}
