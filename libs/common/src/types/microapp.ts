import { ImportFn } from './common';


export type MicroAppMetadata = {
	/**
	 * How the micro app should be mounted under the web component root.
	 * - `shared`: Light DOM.
	 * - `isolated`: Shadow DOM.
	 */
	domType: 'shared' | 'isolated';

	/**
	 * The slug used as unique identifier for the micro app.
	 * It is recommended to use this slug as the root path for the micro app in the URL.
	 */
	slug: string;

	/**
	 * The web component tag name.
	 */
	htmlTag: string;

	/**
	 * If a string, it is URL where to fetch the micro app bundle from.
	 * If a function, it is a function that invokes import().
	 */
	url: string | ImportFn;
};
