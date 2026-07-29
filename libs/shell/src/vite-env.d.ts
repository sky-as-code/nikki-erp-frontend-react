/**
 * The Shell installs the built-in view kit, so its compilation now reaches
 * component files that import CSS modules. Declared locally to keep the
 * declaration independent of whether `vite/client` is referenced.
 */
declare module '*.module.css' {
	const classes: { readonly [key: string]: string };
	export default classes;
}

declare module '*.css';
