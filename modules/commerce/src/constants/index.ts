// Namespaced rather than flattened: the sub-modules declare constants under the same names
// (a `CONFIGURATION_*` exists in more than one), and `export *` would silently drop the clashes.
export * as inventory from './inventory';
export * as purchase from './purchase';
export * as sales from './sales';
// Proxy sub-modules: page metadata only, served by their own micro-apps.
export * as accounting from './accounting';
export * as essential from './essential';
export * as paymentinvoice from './paymentinvoice';
