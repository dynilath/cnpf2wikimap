import EventEmitter from 'eventemitter3';
import { MapInfoDetail, MarkerInfo, MarkerWithInfo, Point } from '../types';

type EventMap = {
  removeMarker: [MarkerWithInfo];
  updateMarker: [{ old: MarkerWithInfo; updated: MarkerInfo }];
  startNewMarker: [Point];
  editMarker: [MarkerWithInfo];

  enableEdit: [];
  disableEdit: [];
  saveEdit: [];

  showMarkers: [];
  hideMarkers: [];
};

export class MapEvents extends EventEmitter<EventMap> {
  constructor (readonly info: MapInfoDetail) {
    super();
  }
}
