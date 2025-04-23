'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import * as request from '@/common/request';
import { EnvVars } from '@/types/envVars';
import { UserSettings } from '../types';

export type ConfigContextType = {
	envVars: EnvVars,
	userSettings: UserSettings | null,
	setOrg: (orgSlug: string) => void,
};

const ConfigContext = createContext<ConfigContextType>(null as any);

export const useConfig = (): ConfigContextType => {
	const context = useContext(ConfigContext);
	if (!context) throw new Error('useConfig must be used within ConfigProvider');
	return {
		envVars: context.envVars,
		userSettings: context.userSettings,
		setOrg: context.setOrg,
	};
};

export type ConfigProviderProps = React.PropsWithChildren & {
	envVars: EnvVars,
};

async function fetchUserSettings(org: string) {
	// const data = await request.get<UserSettings>(`/users/settings`, {
	// 	searchParams: { org }
	// });
	console.log('fetchUserSettings');
	const data = {} as UserSettings;
	return data;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({
	children,
	envVars: initialEnvVars,
}) => {
	const { isAuthenticated } = useAuth();
	const [org, setOrg] = useState<string | null>(null);
	const [envVars] = useState(initialEnvVars);
	const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

	const { data, isSuccess } = useQuery({
		queryKey: ['userSettings', org],
		queryFn: () => fetchUserSettings(org!),
		enabled: isAuthenticated && !!org,
	});

	useEffect(() => {
		isSuccess && setUserSettings(data);
	}, [isSuccess]);

	return (
		<ConfigContext.Provider value={{ envVars, userSettings, setOrg }}>
			{children}
		</ConfigContext.Provider>
	);
};
