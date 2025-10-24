import { delay } from '@nikkierp/common/utils';
import { createContext, useContext, useEffect, useState } from 'react';

// import { useAuth } from '../modules/core/components/auth/AuthProvider';
// import {
// 	NikkiModule,
// 	Organization,
// 	UserPreference,
// 	UserSettings,
// } from '../modules/core/types';

// import { EnvVars } from '@/common/types/envVars';


export type ClientConfigContextType = {
	// envVars: EnvVars;
	// userSettings: UserSettings | null;
	// userPreference: UserPreference;
	// activeModule: NikkiModule | null;
	// activeOrg: Organization | null;
	setActiveModule: (moduleSlug: string) => void;
	setActiveOrg: (orgSlug: string) => void;
};

const ClientConfigContext = createContext<ClientConfigContextType | null>(null);

export const useConfig = (): ClientConfigContextType => {
	const context = useContext(ClientConfigContext);
	if (!context) throw new Error('useConfig must be used within ConfigProvider');
	return context;
};

export type ClientConfigProviderProps = React.PropsWithChildren & {
};

export const ClientConfigProvider: React.FC<ClientConfigProviderProps> = ({
	children,
}) => {
	// const userPrefs = loadLocalPreferences();
	// const { isAuthenticated } = useAuth();
	// const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
	// const [activeOrgSlug, setOrgSlug] = useState<string | null>(
	// 	userPrefs.org ?? null,
	// );
	// const [activeModuleSlug, setModuleSlug] = useState<string | null>(
	// 	userPrefs.org ?? null,
	// );
	// const [activeOrg, setActiveOrg] = useActiveOrg({ userPrefs, userSettings });
	// const [activeModule, setActiveModule] = useActiveModule({
	// 	userPrefs,
	// 	userSettings,
	// });

	// const { data, isSuccess } = useQuery({
	// 	queryKey: ['userSettings', activeOrg],
	// 	queryFn: () => fetchUserSettings(activeOrg?.slug),
	// 	enabled: isAuthenticated && Boolean(activeOrgSlug) && !activeOrg,
	// });

	// useEffect(() => {
	// 	if (isSuccess) {
	// 		setUserSettings(data);
	// 	}
	// }, [isSuccess]);

	// useEffect(() => {
	// 	setActiveOrg(activeOrgSlug!);
	// 	setActiveModule(activeModuleSlug!);
	// }, [userSettings]);

	// const ctxVal: ClientConfigContextType = {
	// 	envVars,
	// 	userSettings,
	// 	userPreference: userPrefs,
	// 	activeOrg,
	// 	activeModule,
	// 	setActiveOrg: setOrgSlug,
	// 	setActiveModule: setModuleSlug,
	// };

	return (
		<>
			{children}
		</>
		// <ClientConfigContext.Provider value={ctxVal}>{children}</ClientConfigContext.Provider>
	);
};

// type SetStringFn = (orgSlug: string) => void;
// type SetNullableOrgFn = (org: Organization | null) => void;
// type SetNullableModuleFn = (org: NikkiModule | null) => void;
// type ActiveOrgParams = {
// 	userPrefs: UserPreference;
// 	userSettings: UserSettings | null;
// };

// function useActiveOrg({
// 	userPrefs,
// 	userSettings,
// }: ActiveOrgParams): [Organization | null, SetStringFn] {
// 	const allOrgs = userSettings?.orgs ?? [];
// 	const org = findOrg(allOrgs, userPrefs.org!);
// 	const [activeOrg, setActiveOrg] = useState<Organization | null>(org);
// 	return [activeOrg, setActiveOrgFactory(userPrefs, allOrgs, setActiveOrg)];
// }

// function setActiveOrgFactory(
// 	userPrefs: UserPreference,
// 	allOrgs: Organization[],
// 	setActiveOrg: SetNullableOrgFn,
// ): SetStringFn {
// 	return (orgSlug: string): void => {
// 		const org = findOrg(allOrgs, orgSlug!);
// 		if (!org) {
// 			return;
// 		}
// 		saveLocalPreferences({ ...userPrefs, org: org.slug });
// 		setActiveOrg(org);
// 	};
// }

// function useActiveModule({
// 	userSettings,
// }: ActiveOrgParams): [NikkiModule | null, SetStringFn] {
// 	const allMods = userSettings?.modules ?? [];
// 	const [activeModule, setActiveModule] = useState<NikkiModule | null>(null);
// 	return [activeModule, setActiveModuleFactory(allMods, setActiveModule)];
// }

// function setActiveModuleFactory(
// 	allMods: NikkiModule[],
// 	setActiveModule: SetNullableModuleFn,
// ): SetStringFn {
// 	return (modSlug: string): void => {
// 		const mod = findModule(allMods, modSlug!);
// 		if (!mod) {
// 			return;
// 		}
// 		setActiveModule(mod);
// 	};
// }

// function findOrg(orgs: Organization[], slug: string): Organization | null {
// 	return orgs.find((org) => org.slug === slug) ?? null;
// }

// function findModule(mods: NikkiModule[], slug: string): NikkiModule | null {
// 	return mods.find((mod) => mod.slug === slug) ?? null;
// }

// const userPrefKey = 'nikkiPrefs';

// function loadLocalPreferences(): UserPreference {
// 	const encoded = localStorage.getItem(userPrefKey);
// 	if (!encoded) {
// 		saveLocalPreferences({});
// 		return {};
// 	}

// 	try {
// 		const decoded = atob(encoded);
// 		const userPref = JSON.parse(decoded) as UserPreference;
// 		return userPref;
// 	}
// 	catch {
// 		saveLocalPreferences({});
// 		return {};
// 	}
// }

// function saveLocalPreferences(preferences: UserPreference): void {
// 	try {
// 		const jsonString = JSON.stringify(preferences);
// 		const encodedData = btoa(jsonString);
// 		localStorage.setItem(userPrefKey, encodedData);
// 	}
// 	catch (error) {
// 		console.error('Failed to save local settings:', error);
// 	}
// }

// async function fetchUserSettings(org: string | null | undefined) {
// 	// const data = await request.get<UserSettings>(`/users/settings`, {
// 	// 	searchParams: { org }
// 	// });
// 	console.log('fetchUserSettings');
// 	await delay(1_000);
// 	const data = { modules, orgs } as UserSettings;
// 	return data;
// }
