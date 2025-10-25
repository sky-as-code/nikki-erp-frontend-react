import { MicroAppMetadata, IMicroAppWebComponent } from '@nikkierp/ui/types';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

import { MicroAppManager, MicroAppPack } from './MicroAppManager';
import { registerReducerFactory } from '../../redux/store';


const MicroAppContext = createContext<MicroAppManager | null>(null);

export const useMicroAppManager = () => {
	const context = useContext(MicroAppContext);
	if (!context) {
		throw new Error('useMicroAppManager must be used within a MicroAppProvider');
	}
	return context;
};

export type MicroAppProviderProps = React.PropsWithChildren & {
	microApps: MicroAppMetadata[];
};

export const MicroAppProvider: React.FC<MicroAppProviderProps> = ({ children, microApps }) => {
	const manager = new MicroAppManager(microApps);
	return (
		<MicroAppContext.Provider value= { manager } >
			{ children }
		</MicroAppContext.Provider>
	);
};

export const LazyMicroApp: React.FC<{ slug: string }> = ({ slug }) => {
	const [microAppPack, setMicroAppPack] = useState<MicroAppPack | null>(null);

	useFetchMicroAppPack(slug, setMicroAppPack);
	const ref = useSetupMicroApp(slug, microAppPack);

	if (!microAppPack) return <div>Loading...</div>;

	return React.createElement(microAppPack.htmlTag, { ref });
};

function useFetchMicroAppPack(slug: string, setMicroAppPack: (pack: MicroAppPack) => void): void {
	const manager = useMicroAppManager();
	useEffect(() => {
		let isMounted = true;

		manager.fetchMicroApp(slug).then((pack) => {
			if (isMounted) {
				pack.bundle();
				setMicroAppPack(pack);
			}
		});

		return () => {
			isMounted = false;
		};
	}, [slug]);
}

function useSetupMicroApp(
	slug: string,
	microAppPack: MicroAppPack | null,
): React.RefObject<IMicroAppWebComponent | null> {
	const ref = useRef<IMicroAppWebComponent | null>(null);
	useEffect(() => {
		if (ref.current && microAppPack) {
			ref.current.props = {
				config: microAppPack.config,
				stateMgmt: {
					registerReducer: registerReducerFactory(slug),
				},
			};
		}
	}, [microAppPack]);

	return ref;
}