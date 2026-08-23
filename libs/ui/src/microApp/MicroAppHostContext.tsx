import { createContext, useContext } from 'react';

import { MicroAppManager } from './MicroAppManager';
import { HostServices, MicroAppApiOptions } from './types';

import type { IMenuRegistry } from '../menu';
import type { ICommandBus } from '@nikkierp/common/commandBus';
import type { IEventBus } from '@nikkierp/common/eventBus';
import type { IViewEngine } from '@nikkierp/viewengine/core';


/**
 * What a host publishes to the components that mount micro-apps.
 *
 * This is the *host* side of the seam; `MicroAppProvider` is the guest side. They are
 * deliberately separate contexts: the host owns the manager and the shared service
 * instances, while a mounted micro-app only ever sees the props handed to its `init`.
 */
export type MicroAppHostContextValue = {
	manager: MicroAppManager,
	host: HostServices,
	/**
	 * How a mounted micro-app reaches the backend. Carried on the context rather than
	 * read from the host's own config, because this library must not know where a
	 * particular host keeps its environment variables or its access token.
	 */
	api: MicroAppApiOptions,
};

/**
 * Exported because the host builds the provider: a host creates the service instances
 * itself -- that is what makes a separately-built bundle able to contribute to the same
 * registries -- and writes them straight into this context.
 */
export const MicroAppHostContext = createContext<MicroAppHostContextValue | null>(null);

export function useMicroAppHostContext(): MicroAppHostContextValue {
	const context = useContext(MicroAppHostContext);
	if (!context) {
		throw new Error('useMicroAppHostContext must be used within a micro-app host provider');
	}
	return context;
}

export const useMicroAppManager = (): MicroAppManager => useMicroAppHostContext().manager;

/**
 * The host-owned services, read from the context rather than constructed.
 *
 * Named `useHost*` rather than `useShell*` on purpose: the Shell wraps these under its own
 * names, and a library that claimed the `useShell*` names would collide with those wrappers
 * the moment both were re-exported from one barrel.
 */
export const useHostCommandBus = (): ICommandBus => useMicroAppHostContext().host.commandBus;

export const useHostViewEngine = (): IViewEngine => useMicroAppHostContext().host.viewEngine;

export const useHostMenuRegistry = (): IMenuRegistry => useMicroAppHostContext().host.menuRegistry;

export const useHostEventBus = (): IEventBus => useMicroAppHostContext().host.eventBus;
