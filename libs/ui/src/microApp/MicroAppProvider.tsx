import { ICommandBus } from '@nikkierp/common/commandBus';
import { EventBus, IEventBus } from '@nikkierp/common/eventBus';
import { RequestMaker } from '@nikkierp/common/request';
import { ViewEngineProvider } from '@nikkierp/viewengine/render';
import React from 'react';

import { MicroAppStateProvider } from './MicroAppStateProvider';
import { MicroAppApiOptions, MicroAppProps, MicroAppRoutingOptions } from './types';
import { ModuleStoreProvider } from '../appState/ModuleStoreProvider';


export type MicroAppContextType = {
	api: MicroAppApiOptions,
	routing: MicroAppRoutingOptions,
};

const MicroAppContext = React.createContext<MicroAppContextType | null>(null);

export function useMicroAppContext(): MicroAppContextType {
	const context = React.useContext(MicroAppContext);
	if (!context) {
		throw new Error('useMicroAppContext must be used within a MicroAppProvider');
	}
	return context;
}

const CommandBusContext = React.createContext<ICommandBus | null>(null);

export function useCommandBus(): ICommandBus {
	const context = React.useContext(CommandBusContext);
	if (!context) {
		throw new Error('useCommandBus must be used within a MicroAppProvider');
	}
	return context;
}

const EventBusContext = React.createContext<IEventBus | null>(null);

export function useEventBus(): IEventBus {
	const context = React.useContext(EventBusContext);
	if (!context) {
		throw new Error('useEventBus must be used within a MicroAppProvider');
	}
	return context;
}

export type MicroAppRouting = MicroAppProps['routing'];

export type MicroAppProviderProps = React.PropsWithChildren & MicroAppProps & {
};

export const MicroAppProvider: React.FC<MicroAppProviderProps> = (props) => {
	// If domType=ISOLATED, this will init the request maker.
	// If domType=SHARED, this will do nothing because Shell already did it.
	RequestMaker.initDefault({
		baseUrl: props.config?.apiBaseUrl ?? props.api.defaultBaseUrl,
		auth: {
			getToken: props.api.getAccessToken,
		},
	});
	// Same distinction: ISOLATED gets its own copy of the module and installs the
	// host's bus; SHARED already sees the Shell's instance, so this is a no-op.
	EventBus.setInstance(props.eventBus);

	return (
		<CommandBusContext.Provider value={props.commandBus}>
			<EventBusContext.Provider value={props.eventBus}>
				<ViewEngineProvider engine={props.viewEngine}>
					<MicroAppContext.Provider value={{
						api: props.api,
						routing: props.routing,
					}}>
						{/*
							The module's own store, on its own react-redux context. The Shell keeps
							the default context, so MicroAppStateProvider's hooks are unaffected.
							A module that created no store renders through untouched.
						*/}
						<ModuleStoreProvider moduleName={props.slug}>
							<MicroAppStateProvider>
								{props.children}
							</MicroAppStateProvider>
						</ModuleStoreProvider>
					</MicroAppContext.Provider>
				</ViewEngineProvider>
			</EventBusContext.Provider>
		</CommandBusContext.Provider>
	);
};
