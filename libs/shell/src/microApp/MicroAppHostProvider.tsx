import { CommandBus, ICommandBus } from '@nikkierp/common/commandBus';
import { IEventBus } from '@nikkierp/common/eventBus';
import { createMenuRegistry, IMenuRegistry, MenuContribution, useMenuContribution } from '@nikkierp/ui/menu';
import {
	HostServices, MicroAppHostContext, MicroAppHostContextValue, MicroAppManager, MicroAppMetadata,
	useMicroAppHostContext,
} from '@nikkierp/ui/microApp';
import { createViewEngine } from '@nikkierp/viewengine/engine';
import { contributeMantineViewKit } from '@nikkierp/viewkit-mantine';
import React, { useMemo, useState } from 'react';

import { registerReducerFactory } from '../appState/store';
import { ensureAccessToken } from '../authenticate/authService';
import { createShellCommandBus, ShellCommandRegistrar } from '../commandBus';
import { useShellEnvVars } from '../config';
import { shellEventBus } from '../eventBus';

import type { IViewEngine } from '@nikkierp/viewengine/core';


export { useMicroAppManager } from '@nikkierp/ui/microApp';

export const useShellCommandBus = (): ICommandBus => useMicroAppHostContext().host.commandBus;

export const useShellViewEngine = (): IViewEngine => useMicroAppHostContext().host.viewEngine;

export const useShellMenuRegistry = (): IMenuRegistry => useMicroAppHostContext().host.menuRegistry;

export const useShellEventBus = (): IEventBus => useMicroAppHostContext().host.eventBus;

/**
 * The menu contributed by `slug`, re-rendering when that module registers.
 *
 * The one hook the Shell's menu bar should call: going through the host context is what
 * guarantees it reads the *host's* registry rather than constructing its own, which would
 * be invisible to every micro-app.
 */
export function useShellMenu(slug?: string | null): MenuContribution | undefined {
	return useMenuContribution(useShellMenuRegistry(), slug);
}

export type MicroAppHostProviderProps = React.PropsWithChildren & {
	microApps: MicroAppMetadata[],
	/** Command handlers owned by the shell implementation. See {@link ShellCommandDeps}. */
	extraRegistrars?: ShellCommandRegistrar[],
};

type ShellHostServices = {
	manager: MicroAppManager,
	host: HostServices,
};

/**
 * Creates the host-owned services exactly once. Everything here is an instance
 * the Shell hands to micro-apps through `init`, which is what makes a
 * separately-built bundle able to contribute to the same registries.
 */
export function MicroAppHostProvider(
	{ children, microApps, extraRegistrars }: MicroAppHostProviderProps,
): React.ReactNode {
	const [services] = useState<ShellHostServices>(() => {
		// The manager takes the reducer registrar rather than reaching for the store itself:
		// it lives in `@nikkierp/ui`, which must not own the Shell's Redux store.
		const manager = new MicroAppManager(microApps, { registerReducerFactory });
		const viewEngine = createViewEngine({ instanceId: 'shell' });
		contributeMantineViewKit(viewEngine);
		// The registry must exist before the bus: the shell.layout.* handlers close over it.
		const menuRegistry = createMenuRegistry();
		// Created at module scope, not here: the Shell's own chrome subscribes above this
		// provider and before it renders. Same instance either way.
		const eventBus = shellEventBus;
		const commandBus = createShellCommandBus(manager, { menuRegistry, extraRegistrars });
		// Installs the fallback singleton for code running outside React and outside `init` —
		// chiefly module service classes, which are constructed at import time. Mirrors the
		// `EventBus.setInstance` call in `MicroAppProvider`.
		CommandBus.setInstance(commandBus);
		const host: HostServices = { commandBus, viewEngine, menuRegistry, eventBus };
		manager.setHostServices(host);
		return { manager, host };
	});

	// Read during render rather than snapshotted into the initializer above, so the base URL
	// keeps tracking config the way it did when `useApiOptions` lived in this file.
	const envVars = useShellEnvVars();
	const value = useMemo<MicroAppHostContextValue>(() => ({
		manager: services.manager,
		host: services.host,
		api: {
			defaultBaseUrl: envVars.BASE_API_URL,
			getAccessToken: ensureAccessToken,
		},
	}), [services, envVars.BASE_API_URL]);

	return (
		<MicroAppHostContext.Provider value={value} >
			{children}
		</MicroAppHostContext.Provider>
	);
}
