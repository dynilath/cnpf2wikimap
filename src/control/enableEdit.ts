import type { Map } from 'leaflet';
import { leaflet } from '../env';
import { MapEvents } from './events';

/**
 * 创建保存编辑的按钮
 * @param map Leaflet 地图实例
 * @param events 地图事件处理器，用于触发保存编辑事件
 * @returns Leaflet EasyButton 实例，用于保存标记编辑
 */
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

/**
 * 创建编辑模式切换按钮
 * @param map Leaflet 地图实例
 * @param events 地图事件处理器，用于触发启用/禁用编辑事件
 * @returns Leaflet EasyButton 实例，具有启用和关闭编辑模式两种状态
 */
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
