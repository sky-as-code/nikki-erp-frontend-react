import { createModuleStore } from '@nikkierp/ui/appState/store';


/**
 * The Shell's own Redux store.
 *
 * Created at module scope because `@storeService` runs at import time, before any
 * component renders. This module must not import the services — they import this.
 *
 * It is registered under `shell` in `ModuleStoreRegistry` and mounted by
 * `ShellProviders` on the dedicated `ModuleStoreContext`, which is a *different*
 * react-redux context from the default one. That separation is what enforces the
 * isolation: no micro-app can select the Shell's state, and the Shell cannot select a
 * micro-app's. Anything that has to cross the boundary goes through the command bus or
 * the event bus.
 */
export const shellStore = createModuleStore('shell');

/** Registry key for the Shell's store, and the `moduleName` its provider mounts. */
export const SHELL_STORE_NAME = 'shell';
