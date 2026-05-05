import { SchemaRegisterOptions, schemaRegistry } from '@nikkierp/common/dynamic_model';
import { RequestMaker } from '@nikkierp/common/request';
import { useRoutingAction, useCurrentStoredPath } from '@nikkierp/ui/appState';
import { actions } from '@nikkierp/ui/appState/routingSlice';
import i18n from '@nikkierp/ui/i18n';
import { MicroAppMetadata } from '@nikkierp/ui/microApp';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider as ReduxProvider, useDispatch } from 'react-redux';
import { Location, useLocation, useNavigate } from 'react-router';

import { MODULE_SCHEMA_NAME } from '@nikkierp/shell/constants';

import { store } from '../appState/store';
import { initAuthService, ensureAccessToken } from '../authenticate/authService';
import { SessionRestore } from '../authenticate/SessionRestore';
import { NikkiAuthenticateStrategy } from '../authenticate/strategies';
import { TokenSessionStorage, TokenLocalStorage } from '../authenticate/tokenStorage';
import { setEnvVarsAction } from '../config/shellConfigSlice';
import { MicroAppHostProvider } from '../microApp';
import { ShellEnvVars } from '../types';


export type ShellProvidersProps = React.PropsWithChildren & {
	microApps: MicroAppMetadata[];
	envVars: Record<string, unknown>;
	fallback?: React.ReactNode;
};

export function ShellProviders(props: ShellProvidersProps) {
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

	// Trick to run once & synchronously
	React.useMemo(() => {
		registerModelSchemas();
	}, []);

	return (
		<ReduxProvider store={store}>
			<InnerShellProviders {...props} />
		</ReduxProvider>
	);
}

function InnerShellProviders(props: ShellProvidersProps): React.ReactNode {
	const routingAction = useRoutingAction();
	const storedPath = useCurrentStoredPath();
	const dispatch = useDispatch();
	const actualLocation = useLocation();
	const navigate = useNavigate();

	React.useEffect(() => {
		if (fullPath(actualLocation) !== storedPath)
			dispatch(actions.resetCurrentPath());
	}, [actualLocation]);

	React.useEffect(() => {
		if (routingAction.action === 'navigateTo') {
			navigate(routingAction.actionParams?.to as string);
		}
	}, [routingAction.actionUpdatedAt]);

	React.useEffect(() => {
		dispatch(setEnvVarsAction(props.envVars as ShellEnvVars));
	}, [dispatch, props.envVars]);

	return (
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