import { createModuleStore } from '@nikkierp/ui/appState/store';


/**
 * The settings micro-app's own Redux store.
 *
 * Created at module scope because `@storeService` runs at import time, before `init()`.
 * This module must not import the services -- they import this.
 *
 * It holds request state, not settings values: the values belong to the module being configured,
 * and reach it through the command bus rather than through this store.
 */
export const settingsStore = createModuleStore('settings');
