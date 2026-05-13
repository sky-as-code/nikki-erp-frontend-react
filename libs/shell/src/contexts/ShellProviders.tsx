import { SchemaRegisterOptions, schemaRegistry } from '@nikkierp/common/dynamic_model';
import { RequestMaker } from '@nikkierp/common/request';
import { useRoutingAction, useCurrentStoredPath } from '@nikkierp/ui/appState';
import { actions } from '@nikkierp/ui/appState/routingSlice';
import i18n, { initI18n } from '@nikkierp/ui/i18n';
import { MicroAppMetadata } from '@nikkierp/ui/microApp';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider as ReduxProvider, useDispatch } from 'react-redux';
import { Location, useLocation, useNavigate } from 'react-router';

import { MODULE_SCHEMA_NAME } from '@nikkierp/shell/constants';

import { store } from '../appState/store';
import { useIsSessionSettled } from '../authenticate';
import { useTryRestoreSession } from '../authenticate/authHooks';
import { initAuthService, ensureAccessToken } from '../authenticate/authService';
import { NikkiAuthenticateStrategy } from '../authenticate/strategies';
import { TokenSessionStorage, TokenLocalStorage } from '../authenticate/tokenStorage';
import { setEnvVarsAction } from '../config/shellConfigSlice';
import { MicroAppHostProvider } from '../microApp';
import { ShellEnvVars } from '../types';
import { useGetUserContext, useLocalSettings } from '../userContext';


export type ShellProvidersProps = React.PropsWithChildren & {
	microApps: MicroAppMetadata[];
	envVars: Record<string, unknown>;
	fallback?: React.ReactNode;
};

export function ShellProviders(props: ShellProvidersProps) {
	// Trick to run synchronously once.
	React.useMemo(() => {
		initServices(props);
		registerModelSchemas();
	}, []);

	return (
		<ReduxProvider store={store}>
			<InnerShellProviders {...props} />
		</ReduxProvider>
	);
}

function initServices(props: ShellProvidersProps): void {
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
	const dispatch = useDispatch();
	const isSessionSettled = useIsSessionSettled();
	const getUserCxt = useGetUserContext();
	const localSettings = useLocalSettings();

	useCalibrateStoredPath();
	useHandleNavigateRequest();
	useTryRestoreSession();

	React.useEffect(() => {
		dispatch(setEnvVarsAction(props.envVars as ShellEnvVars));
	}, [dispatch, props.envVars]);

	React.useEffect(() => {
		if (isSessionSettled) {
			const supportedLangs = getUserCxt.data?.accountSettings.supportedLanguages;
			// This can be the language previously set, or the newly set by getUserContext,
			// or nothing at all.
			let langCode = localSettings?.languageCode;
			if (langCode && supportedLangs && !supportedLangs?.includes(langCode)) {
				langCode = supportedLangs[0];
			}
			initI18n(props.envVars.APP_ENV === 'local', langCode, supportedLangs);
			setIsInitialized(true);
		}
	}, [props.envVars, isSessionSettled]);

	return isInitialized && (
		<I18nextProvider i18n={i18n}>
			<MicroAppHostProvider microApps={props.microApps}>
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
	const dispatch = useDispatch();
	const actualLocation = useLocation();

	React.useEffect(() => {
		if (fullPath(actualLocation) !== storedPath)
			dispatch(actions.resetCurrentPath());
	}, [actualLocation]);
}

function useHandleNavigateRequest(): void {
	const routingAction = useRoutingAction();
	const navigate = useNavigate();

	React.useEffect(() => {
		if (routingAction.action === 'navigateTo') {
			if (routingAction.actionParams?.hardNavigate) {
				window.location.href = routingAction.actionParams?.to as string;
			}
			else {
				navigate(routingAction.actionParams?.to as string);
			}
		}
	}, [routingAction.actionUpdatedAt]);
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