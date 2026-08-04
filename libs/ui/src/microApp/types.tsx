import { ICommandBus } from '@nikkierp/common/commandBus';
import React from 'react';
import { Location, Navigator } from 'react-router-dom';

import { RegisterReducerFn } from '../microApp';
import { ImportFn } from '../types/miscs';

import type { IMenuRegistry } from '../menu';
import type { IEventBus } from '@nikkierp/common/eventBus';
import type { IViewEngine } from '@nikkierp/viewengine/core';


/**
 * Everything the Shell owns and shares with every micro-app, in one bag.
 *
 * These must be *instances created by the host*, never module singletons: a
 * separately-built micro-app bundle gets its own copy of any module it imports,
 * so a singleton registry inside the bundle is invisible to the Shell.
 */
export type HostServices = {
	commandBus: ICommandBus,
	viewEngine: IViewEngine,
	menuRegistry: IMenuRegistry,
	eventBus: IEventBus,
};


export type MicroAppShellProps = {
	microApps: MicroAppMetadata[],
};

export type MicroAppShellBundle = {
	MicroAppShell: React.FC<MicroAppShellProps>,
};

export type MicroAppMetadata = {
	/**
	 * The slug used as unique identifier for the micro app, as well as
	 * the root path for the micro app in the URL. Therefore, it must be URL-friendly.
	 * The value must match the backend ERP module name.
	 */
	slug: MicroAppSlug,

	/**
	 * The base path for the micro app in the URL.
	 * If not specified, the micro app can only be used in widget mode.
	 */
	basePath?: string,

	/**
	 * The web component tag name.
	 */
	htmlTag: string,

	/**
	 * If a string, it is URL where to fetch the micro app bundle from.
	 * If a function, it is a function that invokes import().
	 */
	bundleUrl: string | ImportFn,

	/**
	 * If specified, Shell will fetch the config from this URL and pass it to the micro-app.
	 */
	configUrl?: string,

	/**
	 * List of micro apps that must be fetched before this micro app is used.
	 */
	dependsOn?: MicroAppSlug[],
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
	init: MicroAppBundleInitFn,

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
	htmlTag: string,

	/**
	 * The slug the Shell registered this micro-app under. Also the `/{orgSlug}/{slug}`
	 * URL segment, and the key a module registers its menu contribution against.
	 */
	slug: MicroAppSlug,

	/**
	 * Config fetched from the `configUrl` in MicroAppMetadata.
	 */
	config?: MicroAppConfig,

	registerReducer: RegisterReducerFn,

	/**
	 * The Shell-hosted command bus. Modules subscribe their command handlers here
	 * synchronously during `init` so that lazy command resolution can find them.
	 * Same object as `host.commandBus`; kept for backward compatibility.
	 */
	commandBus: ICommandBus,

	/**
	 * All host-owned services. A module registers its view contributions, command
	 * handlers and schemas against these during `init`.
	 */
	host: HostServices,
};

export type MicroAppBundleInitResult = {
	/**
	 * How the micro app is mounted under the web component root.
	 * - `shared`: Light DOM.
	 * - `isolated`: Shadow DOM.
	 */
	domType: MicroAppDomType,
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
	domType: MicroAppDomType,
	widgetName?: string,
	widgetProps?: Record<string, any>,
	slug: string,
	routing: MicroAppRoutingOptions,
	commandBus: ICommandBus,
	/** Host-owned view engine, provided to the subtree by `MicroAppProvider`. */
	viewEngine: IViewEngine,
	/**
	 * Host-owned event bus. Repeated here rather than read from a Shell context
	 * because an ISOLATED micro-app renders in its own detached React root, which no
	 * Shell context reaches.
	 */
	eventBus: IEventBus,
};

export type MicroAppRoutingOptions = {
	basePath?: string,
	location?: Location,
	navigator?: Navigator,
};

export type MicroAppApiOptions = {
	defaultBaseUrl: string,
	getAccessToken: () => Promise<string>,
};
