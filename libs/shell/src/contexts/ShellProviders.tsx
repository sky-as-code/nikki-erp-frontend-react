import { initRequestMaker } from '@nikkierp/common/request';
import i18n from '@nikkierp/ui/i18n';
import { MicroAppMetadata } from '@nikkierp/ui/microApp';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider as ReduxProvider, useDispatch } from 'react-redux';

import { authService } from '@nikkierp/shell/auth';
import { NikkiAuthenticateStrategy } from '@nikkierp/shell/auth/strategies';

import { setEnvVarsAction } from '../config/shellConfigSlice';
import { store } from '../appState/store';
import { MicroAppHostProvider } from '../microApp';
import { ShellEnvVars } from '../types';


export type ShellProvidersProps = React.PropsWithChildren & {
	microApps: MicroAppMetadata[];
	envVars: Record<string, unknown>;
};

export function ShellProviders(props: ShellProvidersProps) {
	const signInStrategy = new NikkiAuthenticateStrategy();
	authService.strategy = signInStrategy;
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
	const dispatch = useDispatch();

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