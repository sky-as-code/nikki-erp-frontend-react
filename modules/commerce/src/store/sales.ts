import { createModuleStore } from '@nikkierp/ui/appState/store';


/**
 * The Sales micro-app's own Redux store. Created at module scope because `@storeService` runs at
 * import time, before `init()`; this file must not import the services, which import it. Nothing
 * outside the module can read it — crossing that boundary goes through the command or event bus.
 */
export const salesStore = createModuleStore('sales');
