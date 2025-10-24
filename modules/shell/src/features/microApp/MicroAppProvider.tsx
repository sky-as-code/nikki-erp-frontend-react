import { MicroAppMetadata } from '@nikkierp/common/types';
import { createContext, useContext, useEffect, useState } from 'react';

import { MicroAppManager } from './MicroAppManager';


const MicroAppContext = createContext<MicroAppManager | null>(null);

export const useMicroAppManager = () => {
	const context = useContext(MicroAppContext);
	if (!context) {
		throw new Error('useMicroAppManager must be used within a MicroAppProvider');
	}
	return context;
};

export type MicroAppProviderProps = React.PropsWithChildren & {
	remoteApps: MicroAppMetadata[];
};

export const MicroAppProvider: React.FC<MicroAppProviderProps> = ({ children, remoteApps }) => {
	const manager = new MicroAppManager(remoteApps);
	return (
		<MicroAppContext.Provider value= { manager } >
			{ children }
		</MicroAppContext.Provider>
	);
};

export const LazyMicroApp: React.FC<{ slug: string }> = ({ slug }) => {
	const [microApp, setMicroApp] = useState<MicroAppMetadata | null>(null);
	const manager = useMicroAppManager();

	useEffect(() => {
		let isMounted = true;

		manager.fetchMicroApp(slug).then((microApp) => {
			if (isMounted) setMicroApp(microApp);
		});

		return () => {
			isMounted = false;
		};
	}, [slug]);

	if (!microApp) return <div>Loading...</div>;

	// The module defines a <{moduleName}-app> custom element.
	const TagName = microApp.htmlTag;
	return <TagName />;
};