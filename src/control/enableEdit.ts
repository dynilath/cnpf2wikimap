import type { Map } from 'leaflet';
import { MapInfoDetail } from '../types';
import { leaflet } from '../env';
import { MapController } from '.';

function createSaveEditButton (map: Map, mapInfo: MapInfoDetail, control: MapController) {
  return leaflet().easyButton({
    position: 'topright',
    states: [
      {
        stateName: 'save-edit',
        icon: 'fa fa-floppy-o',
        title: '保存修改',
        onClick: function (btn: L.Control.EasyButton, map: L.Map): void {},
      },
    ],
  });
}

export function createEditorButton (map: Map, mapInfo: MapInfoDetail, control: MapController) {
  return leaflet().easyButton({
    position: 'topright',
    states: [
      {
        stateName: 'default',
        icon: 'fa fa-pencil-square-o',
        title: '启用编辑模式',
        onClick: function (btn: L.Control.EasyButton, map: L.Map): void {
          control.enableContextMenu();
          control.enableMarkerMove();

          control.showSaveButton(() => createSaveEditButton(map, mapInfo, control));

          btn.state('close-edit');
        },
      },
      {
        stateName: 'close-edit',
        icon: 'fa fa-times-circle',
        title: '关闭编辑模式',
        onClick: function (btn: L.Control.EasyButton, map: L.Map): void {
          control.disableContextMenu();
          control.disableMarkerMove();

          control.removeSaveButton();

          btn.state('default');
        },
      },
    ],
  });
}
