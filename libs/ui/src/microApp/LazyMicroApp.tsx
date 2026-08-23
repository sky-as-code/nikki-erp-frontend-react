import React, { useContext, useEffect, useRef, useState } from 'react';
import { useInRouterContext, useLocation, UNSAFE_NavigationContext } from 'react-router-dom';

import { useMicroAppHostContext } from './MicroAppHostContext';
import { MicroAppPack } from './MicroAppManager';
import {
	MicroAppApiOptions, MicroAppDomType, MicroAppProps, MicroAppRoutingOptions,
} from './types';
import { IMicroAppWebComponent } from './webComponent';


export type LazyMicroAppProps = Pick<InternalLazyMicroAppProps, 'slug' | 'basePath' | 'fallback'>;

/**
 * Mounts a whole micro-app under `basePath`, downloading it on first render.
 */
export function LazyMicroApp(props: LazyMicroAppProps): React.ReactNode {
	return <InternalLazyMicroApp {...props} />;
}

export type LazyMicroWidgetProps = Pick<InternalLazyMicroAppProps, 'slug' | 'widgetName'>;

/**
 * Mounts one named widget of another micro-app, with no routing of its own.
 *
 * This is how a module renders a piece of UI that another module owns -- the Settings page
 * mounting each feature module's own settings pane, for instance. The owning module declares
 * the widget with `<WidgetRoute name=... />`; nothing else couples the two.
 *
 * It runs the same fetch -> `init` -> custom-element path as {@link LazyMicroApp}, so the
 * owning module is downloaded and initialized on demand, exactly once, and its command
 * handlers subscribe as a side effect.
 */
export function LazyMicroWidget(props: LazyMicroWidgetProps): React.ReactNode {
	return <InternalLazyMicroApp {...props} />;
}

type InternalLazyMicroAppProps = {
	slug: string,
	basePath?: string,
	widgetName?: string,
	fallback?: React.ReactNode,
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
		</>
	);
}

function useFetchMicroAppPack(
	slug: string,
	setMicroAppPack: (pack: MicroAppPack) => void,
	setError: (error: Error | null) => void,
): MicroAppDomType | null {
	const [domType, setDomType] = useState<MicroAppDomType | null>(null);
	const { manager } = useMicroAppHostContext();

	useEffect(() => {
		let isMounted = true;
		setError(null);

		manager.fetchMicroApp(slug).then((pack) => {
			if (isMounted) {
				try {
					const result = manager.initPack(slug, pack);
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

type UseSetupMicroAppOptions = Omit<
	MicroAppProps, 'registerReducer' | 'routing' | 'api' | 'commandBus' | 'viewEngine' | 'eventBus'
> & {
	basePath?: string,
};

function useSetupMicroApp(
	microAppPack: MicroAppPack | null,
	opts: UseSetupMicroAppOptions,
): React.RefObject<IMicroAppWebComponent | null> {
	const [, forceRerender] = useState(0);
	const ref = useRef<IMicroAppWebComponent | null>(null);
	const routingOpts = useRoutingOpts(opts.basePath);
	const apiOpts = useApiOptions();
	const { host } = useMicroAppHostContext();

	useEffect(() => {
		if (ref.current && microAppPack) {
			ref.current.props = {
				config: microAppPack.config,
				routing: routingOpts,
				api: apiOpts,
				commandBus: host.commandBus,
				viewEngine: host.viewEngine,
				eventBus: host.eventBus,
				...opts,
			};
			forceRerender(n => n + 1);
		}
	}, [microAppPack, ref.current, routingOpts.location, host]);

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
	return useMicroAppHostContext().api;
}
