import React from 'react';

import { MicroAppProps } from './webComponent';


export type MicroAppContextType = {
	routing: MicroAppProps['routing'],
};

const MicroAppContext = React.createContext<MicroAppContextType | null>(null);

export function useMicroAppContext(): MicroAppContextType {
	const context = React.useContext(MicroAppContext);
	if (!context) {
		throw new Error('useMicroAppContext must be used within a MicroAppProvider');
	}
	return context;
}

export type MicroAppRouting = MicroAppProps['routing'] & {

};

export type MicroAppProviderProps = React.PropsWithChildren & MicroAppProps & {
};

export const MicroAppProvider: React.FC<MicroAppProviderProps> = (props) => {
	return (
		<MicroAppContext.Provider value={{
			routing: props.routing,
		}}>
			{props.children}
		</MicroAppContext.Provider>
	);
};