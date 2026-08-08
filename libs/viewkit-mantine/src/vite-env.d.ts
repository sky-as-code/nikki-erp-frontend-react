/**
 * Ambient declarations for the assets this package imports.
 *
 * Declared locally rather than via `vite/client` so the kit typechecks without
 * pulling Vite into its own dependency tree; the same declarations also cover
 * the `@nikkierp/ui` source files that resolve into this compilation.
 */
declare module '*.module.css' {
	const classes: { readonly [key: string]: string };
	export default classes;
}

declare module '*.css';
