/**
 * `routingSlice` used to be re-exported here so micro-apps could import it. It has moved
 * to `@nikkierp/shell/routing`: the Shell does not share state with micro-apps, and
 * anything they need from it goes over the command or event bus. Its removal also makes
 * this barrel side-effect-free — it no longer reads `window.location` at import time, so
 * it is safe to load outside a browser.
 */
export * from './reduxActionState';

export * from './store';
