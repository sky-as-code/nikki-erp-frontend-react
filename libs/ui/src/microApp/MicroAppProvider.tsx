import { initRequestMaker } from '@nikkierp/common/request';
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

export type MicroAppRouting = MicroAppProps['routing'];

export type MicroAppProviderProps = React.PropsWithChildren & MicroAppProps & {
};

export const MicroAppProvider: React.FC<MicroAppProviderProps> = (props) => {
	// If domType=ISOLATED, this will init the request maker.
	// If domType=SHARED, this will do nothing because Shell already did it.
	initRequestMaker({
		baseUrl: props.config?.apiBaseUrl ?? props.api.defaultBaseUrl,
		auth: {
			getToken: props.api.getAccessToken,
		},
	});
	return (
		<MicroAppContext.Provider value={{
			api: props.api,
			routing: props.routing,
		}}>
			<MicroAppStateProvider>
				{props.children}
			</MicroAppStateProvider>
		</MicroAppContext.Provider>
	);
};
