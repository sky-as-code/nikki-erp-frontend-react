/**
 * The module-store surface, free of side effects.
 *
 * Separate from the `appState` barrel because that one re-exports `routingSlice`, which
 * reads `window.location` at import time — importing it outside a browser (a Node test,
 * a service file loaded by a decorator) throws. Nothing here touches the DOM.
 */
export * from './ModuleStoreProvider';
export * from './collectServiceMethods';
export * from './decorators';
export * from './moduleStore';
export * from './moduleStoreRegistry';
export * from './selectSliceState';
export * from './serviceSlice';
export * from './types';
export * from './useServiceLayer';
