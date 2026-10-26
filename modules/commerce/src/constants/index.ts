// Namespaced rather than flattened: the three sub-modules declare constants under the same names
// (a `CONFIGURATION_*` exists in more than one), and `export *` would silently drop the clashes.
export * as inventory from './inventory';
export * as purchase from './purchase';
export * as sales from './sales';
