import { MicroAppMetadata, IMicroAppWebComponent, MicroAppDomType, MicroAppProps, MicroAppRoutingOptions, MicroAppApiOptions } from '@nikkierp/ui/microApp';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useInRouterContext, useLocation, UNSAFE_NavigationContext } from 'react-router-dom';

import { MicroAppManager, MicroAppPack } from './MicroAppManager';
import { registerReducerFactory } from '../appState/store';
import { authService } from '../auth';
import { useShellEnvVars } from '../config';


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

export function MicroAppHostProvider({ children, microApps }: MicroAppHostProviderProps): React.ReactNode {
	const manager = new MicroAppManager(microApps);
	return (
		<MicroAppHostContext.Provider value={manager} >
			{children}
		</MicroAppHostContext.Provider>
	);
}

export type LazyMicroAppProps = Pick<InternalLazyMicroAppProps, 'slug' | 'basePath'>;

export function LazyMicroApp(props: LazyMicroAppProps): React.ReactNode {
	return <InternalLazyMicroApp {...props} />;
}

export type LazyMicroWidgetProps = Pick<InternalLazyMicroAppProps, 'slug' | 'widgetName'>;

export function LazyMicroWidget(props: LazyMicroWidgetProps): React.ReactNode {
	return <InternalLazyMicroApp {...props} />;
}

type InternalLazyMicroAppProps = {
	slug: string;
	basePath?: string;
	widgetName?: string;
};

function InternalLazyMicroApp({ slug, basePath, widgetName }: InternalLazyMicroAppProps): React.ReactNode {
	const [microAppPack, setMicroAppPack] = useState<MicroAppPack | null>(null);
	const [error, setError] = useState<Error | null>(null);

	const domType = useFetchMicroAppPack(slug, setMicroAppPack, setError);
	const ref = useSetupMicroApp(microAppPack, {
		slug,
		basePath,
		widgetName,
		domType: domType!, // domType is guaranteed to be not null by the time useSetupMicroApp's useEffect runs.
	});

	if (error) {
		return (
			<div style={{ padding: '20px', color: 'red' }}>
				<h3>Failed to load module: {slug}</h3>
				<p>{error.message}</p>
				<details>
					<summary>Error details</summary>
					<pre>{error.stack}</pre>
				</details>
			</div>
		);
	}

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
}

function useFetchMicroAppPack(
	slug: string,
	setMicroAppPack: (pack: MicroAppPack) => void,
	setError: (error: Error | null) => void,
): MicroAppDomType | null {
	const [domType, setDomType] = useState<MicroAppDomType | null>(null);
	const manager = useMicroAppManager();

	useEffect(() => {
		let isMounted = true;
		setError(null);

		manager.fetchMicroApp(slug).then((pack) => {
			if (isMounted) {
				try {
					const result = pack.init({
						htmlTag: pack.metadata.htmlTag,
						config: pack.config,
						registerReducer: registerReducerFactory(slug),
					});
					setDomType(result.domType);
					setMicroAppPack(pack);
				}
				catch (initError) {
					console.error(`Failed to init micro app ${slug}:`, initError);
					setError(initError instanceof Error ? initError : new Error(String(initError)));
				}
			}
		}).catch((error) => {
			console.error(`Failed to fetch micro app ${slug}:`, error);
			if (isMounted) {
				setError(error instanceof Error ? error : new Error(String(error)));
			}
		});

		return () => {
			isMounted = false;
		};
	}, [slug, manager, setMicroAppPack, setError]);

	return domType;
}

type UseSetupMicroAppOptions = Omit<MicroAppProps, 'registerReducer' | 'routing' | 'api'> & {
	basePath?: string;
};

function useSetupMicroApp(
	microAppPack: MicroAppPack | null,
	opts: UseSetupMicroAppOptions,
): React.RefObject<IMicroAppWebComponent | null> {
	const [, forceRerender] = useState(0);
	const ref = useRef<IMicroAppWebComponent | null>(null);
	const routingOpts = useRoutingOpts(opts.basePath);
	const apiOpts = useApiOptions();

	useEffect(() => {
		if (ref.current && microAppPack) {
			ref.current.props = {
				config: microAppPack.config,
				routing: routingOpts,
				api: apiOpts,
				...opts,
			};
			forceRerender(n => n + 1);
		}
	}, [microAppPack, ref.current, routingOpts.location]);

	return ref;
}

function useRoutingOpts(basePath?: string): MicroAppRoutingOptions {
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

function useApiOptions(): MicroAppApiOptions {
	const envVars = useShellEnvVars();
	const authSvc = authService();
	return {
		defaultBaseUrl: envVars.BASE_API_URL,
		getAccessToken: authSvc.getAccessToken.bind(authSvc),
	};
}