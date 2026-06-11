import { ICommandBus } from '@nikkierp/common/commandBus';
import {
	MicroAppMetadata, IMicroAppWebComponent, MicroAppDomType, MicroAppProps, MicroAppRoutingOptions, MicroAppApiOptions,
} from '@nikkierp/ui/microApp';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useInRouterContext, useLocation, UNSAFE_NavigationContext } from 'react-router-dom';

import { MicroAppManager, MicroAppPack } from './MicroAppManager';
import { ensureAccessToken } from '../authenticate/authService';
import { createShellCommandBus } from '../commandBus';
import { useShellEnvVars } from '../config';


type MicroAppHostContextValue = {
	manager: MicroAppManager,
	commandBus: ICommandBus,
};

const MicroAppHostContext = createContext<MicroAppHostContextValue | null>(null);

function useMicroAppHostContext(): MicroAppHostContextValue {
	const context = useContext(MicroAppHostContext);
	if (!context) {
		throw new Error('useMicroAppManager must be used within a MicroAppProvider');
	}
	return context;
}

export const useMicroAppManager = () => useMicroAppHostContext().manager;

export const useShellCommandBus = (): ICommandBus => useMicroAppHostContext().commandBus;

export type MicroAppHostProviderProps = React.PropsWithChildren & {
	microApps: MicroAppMetadata[];
};

export function MicroAppHostProvider({ children, microApps }: MicroAppHostProviderProps): React.ReactNode {
	const [hostValue] = useState<MicroAppHostContextValue>(() => {
		const manager = new MicroAppManager(microApps);
		return { manager, commandBus: createShellCommandBus(manager) };
	});
	return (
		<MicroAppHostContext.Provider value={hostValue} >
			{children}
		</MicroAppHostContext.Provider>
	);
}

export type LazyMicroAppProps = Pick<InternalLazyMicroAppProps, 'slug' | 'basePath' | 'fallback'>;

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
	fallback?: React.ReactNode;
};

function InternalLazyMicroApp({ slug, basePath, widgetName, fallback }: InternalLazyMicroAppProps): React.ReactNode {
	const [microAppPack, setMicroAppPack] = useState<MicroAppPack | null>(null);
	const [error, setError] = useState<Error | null>(null);

	const domType = useFetchMicroAppPack(slug, setMicroAppPack, setError);
	const ref = useSetupMicroApp(microAppPack, {
		slug,
		basePath,
		widgetName,
		domType: domType!, // domType is guaranteed to be not null by the time useSetupMicroApp's useEffect runs.
	});

	//* TODO: Handle error properly
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

	if (!microAppPack) return fallback ? fallback : <div>Loading...</div>;

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
	const { manager, commandBus } = useMicroAppHostContext();

	useEffect(() => {
		let isMounted = true;
		setError(null);

		manager.fetchMicroApp(slug).then((pack) => {
			if (isMounted) {
				try {
					const result = manager.initPack(slug, pack, commandBus);
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
	}, [slug, manager, commandBus, setMicroAppPack, setError]);

	return domType;
}

type UseSetupMicroAppOptions = Omit<MicroAppProps, 'registerReducer' | 'routing' | 'api' | 'commandBus'> & {
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
	const { commandBus } = useMicroAppHostContext();

	useEffect(() => {
		if (ref.current && microAppPack) {
			ref.current.props = {
				config: microAppPack.config,
				routing: routingOpts,
				api: apiOpts,
				commandBus,
				...opts,
			};
			forceRerender(n => n + 1);
		}
	}, [microAppPack, ref.current, routingOpts.location, commandBus]);

	return ref;
}

function useRoutingOpts(basePath?: string): MicroAppRoutingOptions {
	const isInRouter = useInRouterContext();
	const location = useLocation();
	const navigator = useContext(UNSAFE_NavigationContext).navigator;

	if (isInRouter) {
		return {
			basePath,
			location,
			navigator,
		};
	}
	return {};
}

function useApiOptions(): MicroAppApiOptions {
	const envVars = useShellEnvVars();

	return {
		defaultBaseUrl: envVars.BASE_API_URL,
		getAccessToken: ensureAccessToken,
	};
}

// KYC Event: Before or after the re-verification
// Reverify all customers? - ask Sam & Josh
// => for manually onboarded customers.