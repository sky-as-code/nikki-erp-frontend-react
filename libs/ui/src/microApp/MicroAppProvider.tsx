import { ICommandBus } from '@nikkierp/common/commandBus';
import { RequestMaker } from '@nikkierp/common/request';
import { ViewEngineProvider } from '@nikkierp/viewengine/render';
import React from 'react';

import { MicroAppStateProvider } from './MicroAppStateProvider';
import { MicroAppApiOptions, MicroAppProps, MicroAppRoutingOptions } from './types';


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

	return (
		<CommandBusContext.Provider value={props.commandBus}>
			<ViewEngineProvider engine={props.viewEngine}>
				<MicroAppContext.Provider value={{
					api: props.api,
					routing: props.routing,
				}}>
					<MicroAppStateProvider>
						{props.children}
					</MicroAppStateProvider>
				</MicroAppContext.Provider>
			</ViewEngineProvider>
		</CommandBusContext.Provider>
	);
};
