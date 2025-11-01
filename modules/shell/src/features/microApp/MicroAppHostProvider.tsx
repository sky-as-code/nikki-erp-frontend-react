import { MicroAppMetadata, IMicroAppWebComponent, MicroAppDomType, MicroAppProps, MicroAppRoutingInput } from '@nikkierp/ui/microApp';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useInRouterContext, useLocation, UNSAFE_NavigationContext } from 'react-router-dom';

import { MicroAppManager, MicroAppPack } from './MicroAppManager';
import { registerReducerFactory } from '../../redux/store';


const MicroAppHostContext = createContext<MicroAppManager | null>(null);

export const useMicroAppManager = () => {
	const context = useContext(MicroAppHostContext);
	if (!context) {
		throw new Error('useMicroAppManager must be used within a MicroAppProvider');
	}
	return context;
};

export type MicroAppHostProviderProps = React.PropsWithChildren & {
	microApps: MicroAppMetadata[];
};

export const MicroAppHostProvider: React.FC<MicroAppHostProviderProps> = ({ children, microApps }) => {
	const manager = new MicroAppManager(microApps);
	return (
		<MicroAppHostContext.Provider value= { manager } >
			{ children }
		</MicroAppHostContext.Provider>
	);
};

export type LazyMicroAppProps = Pick<InternalLazyMicroAppProps, 'slug' | 'basePath'>;

export const LazyMicroApp: React.FC<LazyMicroAppProps> = (props) => {
	return <InternalLazyMicroApp {...props} />;
};

export type LazyMicroWidgetProps = Pick<InternalLazyMicroAppProps, 'slug' | 'widgetName'>;

export const LazyMicroWidget: React.FC<LazyMicroWidgetProps> = (props) => {
	return <InternalLazyMicroApp {...props} />;
};

type InternalLazyMicroAppProps = {
	slug: string;
	basePath?: string;
	widgetName?: string;
};

const InternalLazyMicroApp: React.FC<InternalLazyMicroAppProps> = ({ slug, basePath, widgetName }) => {
	const [microAppPack, setMicroAppPack] = useState<MicroAppPack | null>(null);

	const domType = useFetchMicroAppPack(slug, setMicroAppPack);
	const ref = useSetupMicroApp(microAppPack, {
		slug,
		basePath,
		widgetName,
		domType: domType!, // domType is guaranteed to be not null by the time useSetupMicroApp's useEffect runs.
	});

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
			{/* {ref.current && domType === MicroAppDomType.SHARED &&
			createPortal(<ref.current.Component {...ref.current.props} />, ref.current.mountElem)} */}
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
				const result = pack.init({
					htmlTag: pack.metadata.htmlTag,
					config: pack.config,
					registerReducer: registerReducerFactory(slug),
				});
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

type UseSetupMicroAppOptions = Omit<MicroAppProps, 'registerReducer' | 'routing'> & {
	basePath?: string;
};

function useSetupMicroApp(
	microAppPack: MicroAppPack | null,
	opts: UseSetupMicroAppOptions,
): React.RefObject<IMicroAppWebComponent | null> {
	const [, forceRerender] = useState(0);
	const ref = useRef<IMicroAppWebComponent | null>(null);
	const routingInput = useGetRouting(opts.basePath);

	useEffect(() => {
		if (ref.current && microAppPack) {
			ref.current.props = {
				config: microAppPack.config,
				routing: routingInput,
				...opts,
			};
			forceRerender(n => n + 1);
		}
	}, [microAppPack, ref.current, routingInput.location]);

	return ref;
}

function useGetRouting(basePath?: string): MicroAppRoutingInput {
	const isInRouter = useInRouterContext();
	if (isInRouter) {
		return {
			basePath,
			location: useLocation(),
			navigator: useContext(UNSAFE_NavigationContext).navigator,
		};
	}
	return {};
}