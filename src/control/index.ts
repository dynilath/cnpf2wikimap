import type { Map, Control, Marker } from 'leaflet';
import { MapInfoDetail, MarkerInfo, MarkerWithInfo, Point } from '../types';
import { events } from '../events';
import { createMarker, updateMarker } from '../marker';
import { createMarkerInfoEditor } from '../components/MarkerInfoEditor';

export class MapController {
  private contextMenuEnabled = false;

  constructor (readonly markers: MarkerWithInfo[], readonly map: Map, readonly mapInfo: MapInfoDetail) {
    const ctxmenu = (map as any).contextmenu;
    const oldshowAt = ctxmenu._showAtPoint;
    const _this = this;
    ctxmenu._showAtPoint = function (point: any) {
      if (_this.contextMenuEnabled) {
        oldshowAt.call(ctxmenu, point);
      }
    };

    events.on('removeMarker', e => this._removeMarker(e));
    events.on('updateMarker', e => this._updateMarker(e.old.marker, e.updated));
    events.on('startNewMarker', e => this._editMarker({ coords: e }));
    events.on('editMarker', e => this._editMarker(e.info, e.marker));
  }

  private async _editMarker (info: MarkerInfo, _marker?: Marker) {
    const inputs = await createMarkerInfoEditor(info);

    if (_marker) {
      this._updateMarker(_marker, inputs);
    } else {
      const maker = await createMarker(inputs, this.mapInfo);
      this.markers.push(maker);
      maker.marker.addTo(this.map);
      maker.marker.dragging?.enable();

      console.log('添加新标记: ', JSON.stringify(maker.info));
    }
  }

  private _updateMarker (target: Marker, updated: MarkerInfo) {
    const rold = this.markers.find(m => m.marker === target);
    if (!rold) {
      return;
    }

    console.log('更新标记: old=', JSON.stringify(rold.info), ' updated=', JSON.stringify(updated));
    updateMarker(rold, updated, this.mapInfo);
    this.enableSaveButton(true);
  }

  private _removeMarker (arg: MarkerWithInfo) {
    const idx = this.markers.findIndex(m => m.marker === arg.marker);
    if (idx < 0) {
      return;
    }

    console.log('删除标记: ', JSON.stringify(arg.info));
    arg.marker.remove();
    this.markers.splice(idx, 1);
    this.enableSaveButton(true);
  }

  private hideContextMenu () {
    if ((this.map as any).contextmenu.isVisible()) {
      (this.map as any).contextmenu.hide();
    }
  }

  showMarkers () {
    for (const { marker } of this.markers) {
      marker.addTo(this.map);
    }
  }

  hideMarkers () {
    this.hideContextMenu();
    for (const { marker } of this.markers) {
      marker.remove();
    }
  }

  enableContextMenu () {
    this.contextMenuEnabled = true;
  }

  disableContextMenu () {
    this.hideContextMenu();
    this.contextMenuEnabled = false;
  }

  private _saveButton: Control.EasyButton | null = null;

  showSaveButton (buttonF: () => Control.EasyButton) {
    if (!this._saveButton) {
      this._saveButton = buttonF();
    }
    this._saveButton.addTo(this.map);
    this.enableSaveButton();
  }

  private editHappened = false;
  enableSaveButton (enable?: boolean) {
    if (enable !== undefined) this.editHappened = enable;
    if (this._saveButton) {
      if (this.editHappened) {
        this._saveButton.enable();
      } else {
        this._saveButton.disable();
      }
    }
  }

  removeSaveButton () {
    if (this._saveButton) {
      this._saveButton.remove();
    }
  }

  enableMarkerMove () {
    for (const { marker } of this.markers) {
      marker.dragging?.enable();
    }
  }

  disableMarkerMove () {
    for (const { marker } of this.markers) {
      marker.dragging?.disable();
    }
  }
}
