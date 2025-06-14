import type { Map, Control, Marker } from 'leaflet';
import { MapInfoDetail, MarkerInfo, MarkerWithInfo, Point } from '../types';
import { MapEvents } from './events';
import { createMarker, updateMarker } from '../marker';
import { createMarkerDetailEditor } from '../components/MarkerInfoEditor';
import { ApiService } from '../services/ApiService';
import { showInfo } from '../components/info';

export class MapController {
  private contextMenuEnabled = false;

  constructor (readonly markers: MarkerWithInfo[], readonly map: Map, readonly events: MapEvents) {
    const ctxmenu = (map as any).contextmenu;
    const oldshowAt = ctxmenu._showAtPoint;
    const _this = this;
    ctxmenu._showAtPoint = function (point: any) {
      if (_this.contextMenuEnabled) {
        oldshowAt.call(ctxmenu, point);
      }
    };

    events.on('removeMarker', e => this._removeMarker(e));
    events.on('dragMarker', e => this._dragMarker(e.marker, e.coord));
    events.on('newMarker', e => this._newMarker(e));
    events.on('editMarker', e => this._editMarker(e));

    events.on('enableEdit', () => this._enableEditing());
    events.on('disableEdit', () => this._disableEditing());
    events.on('saveEdit', () => this._saveEdit());

    events.on('hideMarkers', () => this._hideMarkers());
    events.on('showMarkers', () => this._showMarkers());
  }

  private async _saveEdit () {
    const result = await showInfo({ title: '确认保存标记修改？', buttons: { confirm: '保存', cancel: '取消' } });
    if (result.confirm) {
      const info = this.markers.reduce((pv, m) => {
        pv.push(m.info);
        return pv;
      }, [] as MarkerInfo[]);
      console.log('保存标记: ', info);
      try {
        await ApiService.savePageContent(
          this.events.info.markerSource,
          JSON.stringify({ markers: info }),
          '更新地图标记信息'
        );
      } catch (e) {
        console.error('保存标记失败: ', e);
        showInfo({ title: '保存标记失败', info: `${e?.message ?? e}`, buttons: { confirm: '确定' } });
        return;
      }

      showInfo({ title: '标记已保存', buttons: { confirm: '确定' } });
      this._enableSaveButton(false);
    }
  }

  private async _newMarker (coords: Point) {
    const inputs = await createMarkerDetailEditor({ coords });
    const maker = await createMarker(inputs, this.events);
    this.markers.push(maker);
    maker.marker.addTo(this.map);
    maker.marker.dragging?.enable();

    console.log('新增标记: ', JSON.stringify(maker.info));
    this._enableSaveButton(true);
  }

  private async _editMarker (marker: Marker) {
    const rold = this.markers.find(m => m.marker === marker);
    if (!rold) {
      return;
    }
    const inputs = await createMarkerDetailEditor(rold.info);
    console.log('编辑标记:', `old=${JSON.stringify(rold.info)}`, `updated=${JSON.stringify(inputs)}`);
    updateMarker(rold, inputs, this.events.info);
    this._enableSaveButton(true);
  }

  private _dragMarker (target: Marker, coord: Point) {
    const rold = this.markers.find(m => m.marker === target);
    if (!rold) {
      return;
    }
    const updated: MarkerInfo = {
      ...rold.info,
      coords: coord,
    };
    console.log('移动标记:', `old=${JSON.stringify(rold.info)}`, `updated=${JSON.stringify(updated)}`);
    updateMarker(rold, updated, this.events.info);
    this._enableSaveButton(true);
  }

  private _removeMarker (arg: Marker) {
    const idx = this.markers.findIndex(m => m.marker === arg);
    if (idx < 0) {
      return;
    }

    console.log('删除标记: ', JSON.stringify(this.markers[idx].info));
    arg.remove();
    this.markers.splice(idx, 1);
    this._enableSaveButton(true);
  }

  private hideContextMenu () {
    if ((this.map as any).contextmenu.isVisible()) {
      (this.map as any).contextmenu.hide();
    }
  }

  private _showMarkers () {
    for (const { marker } of this.markers) {
      marker.addTo(this.map);
    }
  }

  private _hideMarkers () {
    this.hideContextMenu();
    for (const { marker } of this.markers) {
      marker.remove();
    }
  }

  private _saveButton: Control.EasyButton | null = null;

  setSaveButton (arg0: Control.EasyButton) {
    if (this._saveButton) {
      this._saveButton.remove();
    }
    this._saveButton = arg0;
    this._enableSaveButton();
  }

  private editHappened = false;
  private _enableSaveButton (enable?: boolean) {
    if (enable !== undefined) this.editHappened = enable;
    if (this.editHappened) {
      this._saveButton?.enable();
    } else {
      this._saveButton?.disable();
    }
  }

  private _enableEditing () {
    this.contextMenuEnabled = true;

    for (const { marker } of this.markers) {
      marker.dragging?.enable();
    }

    this._saveButton?.addTo(this.map);
  }

  private _disableEditing () {
    this.hideContextMenu();

    this.contextMenuEnabled = false;

    for (const { marker } of this.markers) {
      marker.dragging?.disable();
    }

    this._saveButton?.remove();
  }
}
