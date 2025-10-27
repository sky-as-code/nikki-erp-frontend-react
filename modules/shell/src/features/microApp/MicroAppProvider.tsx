import { MicroAppMetadata, IMicroAppWebComponent, MicroAppDomType } from '@nikkierp/ui/microApp';
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

export type LazyMicroAppProps = Pick<InternalLazyMicroAppProps, 'slug' | 'basePath'>;

export const LazyMicroApp: React.FC<LazyMicroAppProps> = (props) => {
	return <InternalLazyMicroApp {...props} />;
};

export type LazyMicroWidgetProps = Pick<InternalLazyMicroAppProps, 'slug' | 'widgetPath'>;

export const LazyMicroWidget: React.FC<LazyMicroWidgetProps> = (props) => {
	return <InternalLazyMicroApp {...props} />;
};

type InternalLazyMicroAppProps = {
	slug: string;
	basePath?: string;
	widgetPath?: string;
};

const InternalLazyMicroApp: React.FC<InternalLazyMicroAppProps> = ({ slug, basePath, widgetPath }) => {
	const [microAppPack, setMicroAppPack] = useState<MicroAppPack | null>(null);

	const domType = useFetchMicroAppPack(slug, setMicroAppPack);
	const ref = useSetupMicroApp(slug, basePath, widgetPath, microAppPack);

	if (!microAppPack) return <div>Loading...</div>;

	let children: React.ReactNode = null;
	if (ref.current && domType === MicroAppDomType.SHARED) {
		children = (
			<ref.current.Component {...ref.current.props} />
		);
	}

	return (
		<>
			{React.createElement(microAppPack.htmlTag, {
				children,
				ref,
			})}
		</>
	);
};

function useFetchMicroAppPack(slug: string, setMicroAppPack: (pack: MicroAppPack) => void): MicroAppDomType | null {
	const [domType, setDomType] = useState<MicroAppDomType | null>(null);
	const manager = useMicroAppManager();

	useEffect(() => {
		let isMounted = true;

		manager.fetchMicroApp(slug).then((pack) => {
			if (isMounted) {
				const result = pack.initBundle({ htmlTag: pack.metadata.htmlTag });
				setDomType(result.domType);
				setMicroAppPack(pack);
			}
		});

		return () => {
			isMounted = false;
		};
	}, [slug]);

	return domType;
}

function useSetupMicroApp(
	slug: string,
	basePath: string | undefined,
	widgetPath: string | undefined,
	microAppPack: MicroAppPack | null,
): React.RefObject<IMicroAppWebComponent | null> {
	const [, forceRerender] = useState(0);
	const ref = useRef<IMicroAppWebComponent | null>(null);

	useEffect(() => {
		if (ref.current && microAppPack) {
			ref.current.props = {
				config: microAppPack.config,
				basePath,
				widgetPath,
				stateMgmt: {
					registerReducer: registerReducerFactory(slug),
				},
			};
			forceRerender(n => n + 1);
		}
	}, [microAppPack, ref.current]);

	return ref;
}