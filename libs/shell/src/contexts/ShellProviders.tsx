import { initRequestMaker } from '@nikkierp/common/request';
import { useRoutingAction, useCurrentStoredPath } from '@nikkierp/ui/appState';
import { resetCurrentPathAction, tempNavigateToAction } from '@nikkierp/ui/appState/routingSlice';
import i18n from '@nikkierp/ui/i18n';
import { MicroAppMetadata } from '@nikkierp/ui/microApp';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider as ReduxProvider, useDispatch } from 'react-redux';
import { Location, useLocation, useNavigate } from 'react-router';

import { authService, SessionStorageTokenService } from '@nikkierp/shell/auth';
import { NikkiAuthenticateStrategy } from '@nikkierp/shell/auth/strategies';

import { store } from '../appState/store';
import { setEnvVarsAction } from '../config/shellConfigSlice';
import { MicroAppHostProvider } from '../microApp';
import { ShellEnvVars } from '../types';


export type ShellProvidersProps = React.PropsWithChildren & {
	microApps: MicroAppMetadata[];
	envVars: Record<string, unknown>;
};

export function ShellProviders(props: ShellProvidersProps) {
	const signInStrategy = new NikkiAuthenticateStrategy();
	authService.strategy = signInStrategy;

	const tokenService = new SessionStorageTokenService();
	authService.tokenService = tokenService;

	const envVars = props.envVars as ShellEnvVars;
	initRequestMaker({
		baseUrl: envVars.BASE_API_URL,
		auth: {
			getToken: signInStrategy.getAccessToken.bind(signInStrategy),
		},
	});

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
			dispatch(resetCurrentPathAction());
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