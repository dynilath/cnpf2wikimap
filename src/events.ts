import EventEmitter from 'eventemitter3';
import { MarkerInfo, MarkerWithInfo, Point } from './types';

type EventMap = {
  removeMarker: [MarkerWithInfo];
  updateMarker: [{ old: MarkerWithInfo; updated: MarkerInfo }];
  startNewMarker: [Point];
  editMarker: [MarkerWithInfo];
};

class _Events extends EventEmitter<EventMap> {}

export const events = new _Events();
