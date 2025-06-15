import EventEmitter from 'eventemitter3';
import { MapInfoDetail, Point } from '../types';
import type { Marker } from 'leaflet';

type EventMap = {
  removeMarker: [Marker];
  dragMarker: [{ marker: Marker; coord: Point }];
  newMarker: [Point];
  editMarker: [Marker];

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
