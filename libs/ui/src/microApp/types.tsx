import React from 'react';
import { Location, Navigator } from 'react-router-dom';

import { RegisterReducerFn } from '../appState';
import { ImportFn } from '../types/miscs';


export type MicroAppShellProps = {
	microApps: MicroAppMetadata[],
};

export type MicroAppShellBundle = {
	MicroAppShell: React.FC<MicroAppShellProps>;
};

export type MicroAppMetadata = {
	/**
	 * The slug used as unique identifier for the micro app, as well as
	 * the root path for the micro app in the URL.
	 * Must be in camelCase.
	 */
	slug: MicroAppSlug;

	/**
	 * The base path for the micro app in the URL.
	 * If not specified, the micro app can only be used in widget mode.
	 */
	basePath?: string;

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

	/**
	 * List of micro apps that must be fetched before this micro app is used.
	 */
	dependsOn?: MicroAppSlug[];
};

/**
 * Defines web component, register reducer with state management, etc.
 */
// export type MicroAppBundle = (opts: MicroAppBundleOptions) => MicroAppBundleInitResult;
export type MicroAppBundle = {
	/**
	 * Initializes the Micro-app's before it is used by Shell.
	 * This function is invoked once when the Micro-app bundle is downloaded.
	 */
	init: MicroAppBundleInitFn;

	/**
	 * Defines the web component before it is mounted by Shell.
	 * This function is invoked every time Shell is going to mount the Micro-app.
	 * So it must be idempotent when calling with the same `htmlTag`.
	 */
	// defineWebComponent(opts: MicroAppBundleDefineOptions): MicroAppBundleDefineResult;

	/**
	 * Initializes the Micro-app's initial state as well as set up the state management.
	 * This function is invoked once when the Micro-app bundle is downloaded.
	 */
	// initState(opts: MicroAppBundleStateOptions): void;
};

export type MicroAppBundleInitFn = (opts: MicroAppBundleInitOptions) => MicroAppBundleInitResult;

export type MicroAppBundleInitOptions = {
	/**
	 * The web component tag name.
	 * The Shell will determine this tag name to avoid conflicts with other micro apps.
	 */
	htmlTag: string;

	/**
	 * Config fetched from the `configUrl` in MicroAppMetadata.
	 */
	config?: MicroAppConfig;

	registerReducer: RegisterReducerFn
};

export type MicroAppBundleInitResult = {
	/**
	 * How the micro app is mounted under the web component root.
	 * - `shared`: Light DOM.
	 * - `isolated`: Shadow DOM.
	 */
	domType: MicroAppDomType;
};

// export type MicroAppBundleStateOptions = {
// 	registerReducer: RegisterReducerFn
// };

export type MicroAppConfig = Record<string, any> & {
	apiBaseUrl?: string,
};
export type MicroAppSlug = string;

export enum MicroAppDomType {
	SHARED = 'shared',
	ISOLATED = 'isolated',
}


export type MicroAppProps = {
	api: MicroAppApiOptions,
	config?: MicroAppConfig,
	domType: MicroAppDomType;
	widgetName?: string,
	widgetProps?: Record<string, any>,
	slug: string,
	routing: MicroAppRoutingOptions,
};

export type MicroAppRoutingOptions = {
	basePath?: string,
	location?: Location,
	navigator?: Navigator,
};

export type MicroAppApiOptions = {
	defaultBaseUrl: string,
	getAccessToken: () => string,
};
