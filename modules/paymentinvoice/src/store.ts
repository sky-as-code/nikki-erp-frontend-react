import { createModuleStore } from '@nikkierp/ui/appState/store';


/**
 * The Payment & Invoice micro-app's own Redux store.
 *
 * Created at module scope because `@storeService` runs at import time, before `init()`.
 * This module must not import the services — they import this.
 *
 * The Shell cannot read this store and neither can a sibling micro-app: anything that
 * has to cross that boundary goes through the command bus or the event bus.
 */
export const paymentInvoiceStore = createModuleStore('paymentinvoice');
