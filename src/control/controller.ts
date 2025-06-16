import type { Map, Control, Marker } from 'leaflet';
import { MarkerInfo, MarkerWithInfo, Point } from '../types';
import { MapEvents } from './events';
import { createMarker, updateMarker } from '../marker';
import { createMarkerDetailEditor } from '../components/MarkerInfoEditor';
import { ApiService } from '../services/ApiService';
import { showInfo } from '../components/info';

/**
 * 地图控制器类
 * 负责处理地图上的标记操作，包括创建、编辑、删除、保存等功能
 * 以及编辑模式的启用/禁用和标记的显示/隐藏
 */
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

  /**
   * 保存编辑的标记信息到服务器
   * 显示确认对话框，用户确认后将所有标记信息保存到 API
   * @private
   */
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

  /**
   * 创建新的标记
   * 显示标记编辑器，用户输入信息后在指定坐标创建新标记
   * @param coords 新标记的坐标位置
   * @private
   */
  private async _newMarker (coords: Point) {
    const inputs = await createMarkerDetailEditor({ coords });
    const maker = await createMarker(inputs, this.events);
    this.markers.push(maker);
    maker.marker.addTo(this.map);
    maker.marker.dragging?.enable();

    console.log('新增标记: ', JSON.stringify(maker.info));
    this._enableSaveButton(true);
  }

  /**
   * 编辑现有标记的信息
   * 显示标记编辑器，用户修改信息后更新标记
   * @param marker 要编辑的 Leaflet 标记实例
   * @private
   */
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

  /**
   * 处理标记拖拽事件
   * 当用户拖拽标记到新位置时，更新标记的坐标信息
   * @param target 被拖拽的标记实例
   * @param coord 新的坐标位置
   * @private
   */
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

  /**
   * 删除指定的标记
   * 从地图上移除标记并从标记列表中删除
   * @param arg 要删除的标记实例
   * @private
   */
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

  /**
   * 隐藏右键上下文菜单
   * 如果上下文菜单当前可见，则将其隐藏
   * @private
   */
  private hideContextMenu () {
    if ((this.map as any).contextmenu.isVisible()) {
      (this.map as any).contextmenu.hide();
    }
  }

  /**
   * 显示所有标记
   * 将所有隐藏的标记重新添加到地图上
   * @private
   */
  private _showMarkers () {
    for (const { marker } of this.markers) {
      marker.addTo(this.map);
    }
  }

  /**
   * 隐藏所有标记
   * 从地图上移除所有标记（但不删除数据），同时隐藏上下文菜单
   * @private
   */
  private _hideMarkers () {
    this.hideContextMenu();
    for (const { marker } of this.markers) {
      marker.remove();
    }
  }

  private _saveButton: Control.EasyButton | null = null;

  /**
   * 设置保存按钮实例
   * 替换当前的保存按钮（如果存在）并初始化按钮状态
   * @param arg0 新的保存按钮实例
   */
  setSaveButton (arg0: Control.EasyButton) {
    if (this._saveButton) {
      this._saveButton.remove();
    }
    this._saveButton = arg0;
    this._enableSaveButton();
  }

  private editHappened = false;
  /**
   * 启用或禁用保存按钮
   * 根据是否有未保存的编辑来控制保存按钮的可用状态
   * @param enable 可选参数，指定是否启用保存按钮。如果不提供，则使用当前的编辑状态
   * @private
   */
  private _enableSaveButton (enable?: boolean) {
    if (enable !== undefined) this.editHappened = enable;
    if (this.editHappened) {
      this._saveButton?.enable();
    } else {
      this._saveButton?.disable();
    }
  }

  /**
   * 启用编辑模式
   * 启用右键上下文菜单，允许拖拽标记，并显示保存按钮
   * @private
   */
  private _enableEditing () {
    this.contextMenuEnabled = true;

    for (const { marker } of this.markers) {
      marker.dragging?.enable();
    }

    this._saveButton?.addTo(this.map);
  }

  /**
   * 禁用编辑模式
   * 隐藏上下文菜单，禁用标记拖拽功能，并移除保存按钮
   * @private
   */
  private _disableEditing () {
    this.hideContextMenu();

    this.contextMenuEnabled = false;

    for (const { marker } of this.markers) {
      marker.dragging?.disable();
    }

    this._saveButton?.remove();
  }
}
