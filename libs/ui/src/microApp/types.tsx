import React from 'react';

import { ImportFn } from '../types/miscs';


export type MicroAppShellProps = {
	microApps: MicroAppMetadata[],
};

export type MicroAppShellBundle = {
	AppShell: React.FC<MicroAppShellProps>;
};


export type MicroAppMetadata = {
	/**
	 * How the micro app should be mounted under the web component root.
	 * - `shared`: Light DOM.
	 * - `isolated`: Shadow DOM.
	 */
	// domType: MicroAppDomType;

	/**
	 * The slug used as unique identifier for the micro app, as well as
	 * the root path for the micro app in the URL.
	 * Must be in camelCase.
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
	bundleUrl: string | ImportFn;

	/**
	 * If specified, Shell will fetch the config from this URL and pass it to the micro-app.
	 */
	configUrl?: string,
};

/**
 * Defines web component, register reducer with state management, etc.
 */
export type MicroAppBundle = (opts: MicroAppBundleOptions) => MicroAppBundleInitResult;

export type MicroAppBundleOptions = {
	/**
	 * The web component tag name.
	 * The Shell will determine this tag name to avoid conflicts with other micro apps.
	 */
	htmlTag: string;
};

export type MicroAppBundleInitResult = {
	/**
	 * How the micro app is mounted under the web component root.
	 * - `shared`: Light DOM.
	 * - `isolated`: Shadow DOM.
	 */
	domType: MicroAppDomType;
};

export type MicroAppConfig = Record<string, any>;
export enum MicroAppDomType {
	SHARED = 'shared',
	ISOLATED = 'isolated',
}
