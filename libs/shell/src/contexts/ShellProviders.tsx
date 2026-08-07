import { SchemaRegisterOptions, schemaRegistry } from '@nikkierp/common/dynamicModel';
import { IEventBus } from '@nikkierp/common/eventBus';
import { RequestMaker } from '@nikkierp/common/request';
import { SESSION_AUTHORIZATION_ERROR_TOPIC } from '@nikkierp/common/service';
import { ModuleStoreProvider, useServiceLayer } from '@nikkierp/ui/appState/store';
import i18n, { initI18n } from '@nikkierp/ui/i18n';
import { MicroAppMetadata } from '@nikkierp/ui/microApp';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider as ReduxProvider } from 'react-redux';
import { Location, useLocation, useNavigate } from 'react-router';

import { MODULE_SCHEMA_NAME } from '@nikkierp/shell/constants';

import { SHELL_STORE_NAME, shellStore } from '../appState/shellStore';
import { store } from '../appState/store';
import { useIsSessionSettled } from '../authenticate';
import { useTryRestoreSession } from '../authenticate/authHooks';
import { initAuthService, ensureAccessToken } from '../authenticate/authService';
import { NikkiAuthenticateStrategy } from '../authenticate/strategies';
import { TokenSessionStorage, TokenLocalStorage } from '../authenticate/tokenStorage';
import { ShellCommandRegistrar } from '../commandBus';
import { setEnvVarsAction } from '../config/shellConfigSlice';
import { shellEventBus } from '../eventBus';
import { MicroAppHostProvider } from '../microApp';
import {
	NavigateEventPayload, routingService, SHELL_EVENTS, useCurrentStoredPath,
} from '../routing';
import { ShellEnvVars } from '../types';
import { useGetUserContext, useLocalSettings } from '../userContext';


export type ShellProvidersProps = React.PropsWithChildren & {
	microApps: MicroAppMetadata[],
	envVars: Record<string, unknown>,
	fallback?: React.ReactNode,
	/**
	 * Command handlers owned by this shell implementation rather than by `@nikkierp/shell`.
	 * They subscribe alongside the built-in Shell handlers, when the bus is created.
	 */
	extraRegistrars?: ShellCommandRegistrar[],
};

export function ShellProviders(props: ShellProvidersProps) {
	// Trick to run synchronously once.
	React.useMemo(() => {
		initServices(props);
		registerModelSchemas();
	}, []);

	return (
		<ReduxProvider store={store}>
			{/*
				The Shell's own store, on the dedicated ModuleStoreContext. It sits inside the
				default-context provider above so both coexist while slices migrate across one
				at a time; the contexts are separate, so neither can see the other's state.
			*/}
			<ModuleStoreProvider moduleName={SHELL_STORE_NAME}>
				<InnerShellProviders {...props} />
			</ModuleStoreProvider>
		</ReduxProvider>
	);
}

function initServices(props: ShellProvidersProps): void {
	// Synchronously, before the first render: `setIsLocalEnv` is a module-global side
	// effect and `useShellEnvVars()` is read during render, so an effect would land a
	// paint too late.
	shellStore.dispatch(setEnvVarsAction(props.envVars as ShellEnvVars));

	const signInStrategy = new NikkiAuthenticateStrategy();
	const accessTokenStorage = new TokenSessionStorage('nikki_access_token');
	const refreshTokenStorage = new TokenLocalStorage('nikki_refresh_token');

	initAuthService({
		strategy: signInStrategy,
		accessTokenStorage: accessTokenStorage,
		refreshTokenStorage: refreshTokenStorage,
	});

	const envVars = props.envVars as ShellEnvVars;
	RequestMaker.initDefault({
		baseUrl: envVars.BASE_API_URL,
		auth: {
			getToken: ensureAccessToken,
		},
	});
}

function InnerShellProviders(props: ShellProvidersProps): React.ReactNode {
	const [isInitialized, setIsInitialized] = React.useState(false);
	const isSessionSettled = useIsSessionSettled();
	const getUserCxt = useGetUserContext();
	const localSettings = useLocalSettings();

	useCalibrateStoredPath();
	useHandleNavigateRequest(shellEventBus);
	useHandleAuthorizationError(shellEventBus);
	useTryRestoreSession();

	// `envVars` is set synchronously in `initServices`, not here: it must be readable on
	// the very first render.
	React.useEffect(() => {
		if (isSessionSettled) {
			const supportedLangs = getUserCxt.data?.accountSettings.supportedLanguages;
			// This can be the language previously set, or the newly set by getUserContext,
			// or nothing at all.
			let langCode = localSettings?.languageCode;
			if (langCode && supportedLangs && !supportedLangs?.includes(langCode)) {
				langCode = supportedLangs[0];
			}
			// `initI18n` is one-shot: this effect re-runs whenever `envVars` or the session
			// settles, and re-initializing the live instance would blank the loaded namespace
			// and surface raw `common:*` keys until the refetch lands.
			initI18n(props.envVars.APP_ENV === 'local', langCode, supportedLangs);
			setIsInitialized(true);
		}
	}, [props.envVars, isSessionSettled]);

	return isInitialized && (
		<I18nextProvider i18n={i18n}>
			<MicroAppHostProvider microApps={props.microApps} extraRegistrars={props.extraRegistrars}>
				{props.children}
			</MicroAppHostProvider>
		</I18nextProvider>
	);
}

function fullPath(location: Location): string {
	return `${location.pathname}${location.search}${location.hash}`;
}

function useCalibrateStoredPath(): void {
	const storedPath = useCurrentStoredPath();
	const actualLocation = useLocation();
	const { dispatchMethod: resetCurrentPath } = useServiceLayer(routingService.resetCurrentPath);

	React.useEffect(() => {
		if (fullPath(actualLocation) !== storedPath) resetCurrentPath();
	}, [actualLocation]);
}

/**
 * Performs the navigation a `shell:routing:navigate` event asks for.
 *
 * This replaces an effect that polled `actionUpdatedAt`, a `Date.now()` stamp kept in
 * slice state: two navigations in the same millisecond produced no change and the second
 * was silently dropped. An event is delivered once, per publish.
 */
function useHandleNavigateRequest(eventBus: IEventBus): void {
	const navigate = useNavigate();

	React.useEffect(
		() => eventBus.subscribe<NavigateEventPayload>(SHELL_EVENTS.ROUTING_NAVIGATE, (payload) => {
			if (payload.hardNavigate) {
				window.location.href = payload.to;
			}
			else {
				navigate(payload.to);
			}
		}),
		[eventBus, navigate],
	);
}

/** Sends the user to sign-in when any service call reports an authorization failure. */
function useHandleAuthorizationError(eventBus: IEventBus): void {
	React.useEffect(
		() => eventBus.subscribe(SESSION_AUTHORIZATION_ERROR_TOPIC, () => {
			void routingService.navigateTo({ to: '/signin' });
		}),
		[eventBus],
	);
}

function registerModelSchemas(): void {
	const baseOpts: Pick<SchemaRegisterOptions, 'requestMaker'> = {
		requestMaker: RequestMaker.default(),
	};

	schemaRegistry.register([{
		...baseOpts,
		schemaName: MODULE_SCHEMA_NAME,
		resourcePath: 'v1/essential/modules',
	}]);
}