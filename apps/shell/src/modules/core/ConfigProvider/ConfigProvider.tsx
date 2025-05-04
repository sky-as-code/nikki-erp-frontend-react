'use client';

import {
	IconCalendarEvent, IconChecklist, IconCalendar,
	IconClock, IconBook, IconUsers, IconBuildingStore, IconChartBar,
	IconLayoutDashboard, IconRefresh, IconKey, IconCalculator,
	IconFiles, IconCheckbox, IconClock24, IconChartPie, IconFirstAidKit,
	IconWorld, IconLibrary, IconHeart, IconMailShare,
	IconBrandCampaignmonitor, IconChartDots, IconFlame, IconForms,
	IconCreditCard, IconBox, IconBuildingFactory, IconCertificate,
	IconBarcode, IconTool, IconHammer, IconUserCircle, IconUserSquare,
	IconReceipt2, IconStars, IconCoins, IconSearch, IconArrowBack,
	IconClockPause, IconSettings,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useState } from 'react';

import { useAuth } from '../auth/AuthProvider';
import { NikkiModule, Organization, UserPreference, UserSettings } from '../types';

import * as request from '@/common/request';
import { delay } from '@/common/utils';
import { EnvVars } from '@/types/envVars';

export type ConfigContextType = {
	envVars: EnvVars,
	userSettings: UserSettings | null,
	userPreference: UserPreference,
	activeModule: NikkiModule | null,
	activeOrg: Organization | null,
	setActiveModule: (moduleSlug: string) => void,
	setActiveOrg: (orgSlug: string) => void,
};

const ConfigContext = createContext<ConfigContextType>(null as any);

export const useConfig = (): ConfigContextType => {
	const context = useContext(ConfigContext);
	if (!context) throw new Error('useConfig must be used within ConfigProvider');
	return context;
};

export type ConfigProviderProps = React.PropsWithChildren & {
	envVars: EnvVars,
};

export const ConfigProvider: React.FC<ConfigProviderProps> = ({
	children,
	envVars: initialEnvVars,
}) => {
	const userPrefs = loadLocalPreferences();
	const { isAuthenticated } = useAuth();
	const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
	const [activeOrgSlug, setOrgSlug] = useState<string | null>(userPrefs.org ?? null);
	const [activeModuleSlug, setModuleSlug] = useState<string | null>(userPrefs.org ?? null);
	const [activeOrg, setActiveOrg] = useActiveOrg({ userPrefs, userSettings });
	const [activeModule, setActiveModule] = useActiveModule({ userPrefs, userSettings });
	const [envVars] = useState(initialEnvVars);

	const { data, isSuccess } = useQuery({
		queryKey: ['userSettings', activeOrg],
		queryFn: () => fetchUserSettings(activeOrg?.slug),
		enabled: isAuthenticated && Boolean(activeOrgSlug) && !activeOrg,
	});

	useEffect(() => {
		if (isSuccess) {
			setUserSettings(data);
		}
	}, [isSuccess]);

	useEffect(() => {
		setActiveOrg(activeOrgSlug!);
		setActiveModule(activeModuleSlug!);
	}, [userSettings]);

	const ctxVal: ConfigContextType = {
		envVars,
		userSettings,
		userPreference: userPrefs,
		activeOrg,
		activeModule,
		setActiveOrg: setOrgSlug,
		setActiveModule: setModuleSlug,
	};

	return (
		<ConfigContext.Provider value={ctxVal}>
			{children}
		</ConfigContext.Provider>
	);
};

type SetStringFn = (orgSlug: string) => void;
type SetNullableOrgFn = (org: Organization | null) => void;
type SetNullableModuleFn = (org: NikkiModule | null) => void;
type ActiveOrgParams = {
	userPrefs: UserPreference,
	userSettings: UserSettings | null,
};
function useActiveOrg({ userPrefs, userSettings }: ActiveOrgParams): [Organization | null, SetStringFn] {
	const allOrgs = userSettings?.orgs ?? [];
	const org = findOrg(allOrgs, userPrefs.org!);
	const [activeOrg, setActiveOrg] = useState<Organization | null>(org);
	return [
		activeOrg,
		setActiveOrgFactory(userPrefs, allOrgs, setActiveOrg),
	];
}

function setActiveOrgFactory(
	userPrefs: UserPreference,
	allOrgs: Organization[],
	setActiveOrg: SetNullableOrgFn,
): SetStringFn {
	return (orgSlug: string): void => {
		const org = findOrg(allOrgs, orgSlug!);
		if (!org) {
			return;
		}
		saveLocalPreferences({ ...userPrefs, org: org.slug });
		setActiveOrg(org);
	};
}

function useActiveModule({ userSettings }: ActiveOrgParams): [NikkiModule | null, SetStringFn] {
	const allMods = userSettings?.modules ?? [];
	const [activeModule, setActiveModule] = useState<NikkiModule | null>(null);
	return [
		activeModule,
		setActiveModuleFactory(allMods, setActiveModule),
	];
}

function setActiveModuleFactory(
	allMods: NikkiModule[],
	setActiveModule: SetNullableModuleFn,
): SetStringFn {
	return (modSlug: string): void => {
		const mod = findModule(allMods, modSlug!);
		if (!mod) {
			return;
		}
		setActiveModule(mod);
	};
}

function findOrg(orgs: Organization[], slug: string): Organization | null {
	return orgs.find((org) => org.slug === slug) ?? null;
}

function findModule(mods: NikkiModule[], slug: string): NikkiModule | null {
	return mods.find((mod) => mod.slug === slug) ?? null;
}

const userPrefKey = 'nikkiPrefs';

function loadLocalPreferences(): UserPreference {
	const encoded = localStorage.getItem(userPrefKey);
	if (!encoded) {
		saveLocalPreferences({});
		return {};
	};

	try {
		const decoded = atob(encoded);
		const userPref = JSON.parse(decoded) as UserPreference;
		return userPref;
	}
	catch {
		saveLocalPreferences({});
		return {};
	}
}

function saveLocalPreferences(preferences: UserPreference): void {
	try {
		const jsonString = JSON.stringify(preferences);
		const encodedData = btoa(jsonString);
		localStorage.setItem(userPrefKey, encodedData);
	}
	catch (error) {
		console.error('Failed to save local settings:', error);
	}
}

async function fetchUserSettings(org: string | null | undefined) {
	// const data = await request.get<UserSettings>(`/users/settings`, {
	// 	searchParams: { org }
	// });
	console.log('fetchUserSettings');
	await delay(1_000);
	const data = { modules, orgs } as UserSettings;
	return data;
}

const orgs: Organization[] = [
	{ id: '1', name: 'Apples', slug: 'apples', logo: '🍎' },
	{ id: '2', name: 'Bananas', slug: 'bananas', logo: '🍌' },
	{ id: '3', name: 'Broccoli', slug: 'broccoli', logo: '🥦' },
	{ id: '4', name: 'Carrots', slug: 'carrots', logo: '🥕' },
	// { id: '5', name: 'Chocolate', slug: 'chocolate', logo: '🍫' },
	// { id: '6', name: 'Grapes', slug: 'grapes', logo: '🍇' },
	// { id: '7', name: 'Lemon', slug: 'lemon', logo: '🍋' },
	// { id: '8', name: 'Lettuce', slug: 'lettuce', logo: '🥬' },
	// { id: '9', name: 'Mushrooms', slug: 'mushrooms', logo: '🍄' },
	// { id: '10', name: 'Oranges', slug: 'oranges', logo: '🍊' },
	// { id: '11', name: 'Potatoes', slug: 'potatoes', logo: '🥔' },
	// { id: '12', name: 'Tomatoes', slug: 'tomatoes', logo: '🍅' },
	// { id: '13', name: 'Eggs', slug: 'eggs', logo: '🥚' },
	// { id: '14', name: 'Milk', slug: 'milk', logo: '🥛' },
	// { id: '15', name: 'Bread', slug: 'bread', logo: '🍞' },
	// { id: '16', name: 'Chicken', slug: 'chicken', logo: '🍗' },
	// { id: '17', name: 'Hamburger', slug: 'hamburger', logo: '🍔' },
	// { id: '18', name: 'Cheese', slug: 'cheese', logo: '🧀' },
	// { id: '19', name: 'Steak', slug: 'steak', logo: '🥩' },
	// { id: '20', name: 'French Fries', slug: 'french-fries', logo: '🍟' },
	// { id: '21', name: 'Pizza', slug: 'pizza', logo: '🍕' },
	// { id: '22', name: 'Cauliflower', slug: 'cauliflower', logo: '🥦' },
	// { id: '23', name: 'Peanuts', slug: 'peanuts', logo: '🥜' },
	// { id: '24', name: 'Ice Cream', slug: 'ice-cream', logo: '🍦' },
	// { id: '25', name: 'Honey', slug: 'honey', logo: '🍯' },
	// { id: '26', name: 'Baguette', slug: 'baguette', logo: '🥖' },
	// { id: '27', name: 'Sushi', slug: 'sushi', logo: '🍣' },
	// { id: '28', name: 'Kiwi', slug: 'kiwi', logo: '🥝' },
	// { id: '29', name: 'Strawberries', slug: 'strawberries', logo: '🍓' },
];


const modules: NikkiModule[] = [
	{ label: 'Discuss', slug: 'discuss' },
	{ icon: IconSettings, label: 'Settings', slug: 'settings' },
	{ icon: IconCalendarEvent, label: 'Meeting Rooms', slug: 'meeting-rooms', color: 'teal' },
	{ icon: IconChecklist, label: 'To-do', slug: 'todo', color: 'blue' },
	{ icon: IconCalendar, label: 'Calendar', slug: 'calendar', color: 'orange' },
	{ icon: IconClock, label: 'Appointments', slug: 'appointments', color: 'teal' },
	{ icon: IconLibrary, label: 'Knowledge', slug: 'knowledge', color: 'teal' },
	{ icon: IconUsers, label: 'Contacts', slug: 'contacts', color: 'teal' },
	{ icon: IconBuildingStore, label: 'CRM', slug: 'crm', color: 'cyan' },
	{ icon: IconChartBar, label: 'Sales', slug: 'sales', color: 'red' },
	{ icon: IconLayoutDashboard, label: 'Dashboards', slug: 'dashboards', color: 'blue' },
	{ icon: IconRefresh, label: 'Subscriptions', slug: 'subscriptions', color: 'green' },
	{ icon: IconKey, label: 'Rental', slug: 'rental', color: 'violet' },
	{ icon: IconCalculator, label: 'Accounting', slug: 'accounting', color: 'orange' },
	{ icon: IconFiles, label: 'Documents', slug: 'documents', color: 'blue' },
	{ icon: IconCheckbox, label: 'Project', slug: 'project', color: 'teal' },
	{ icon: IconClock24, label: 'Timesheets', slug: 'timesheets', color: 'indigo' },
	{ icon: IconChartPie, label: 'Planning', slug: 'planning', color: 'orange' },
	{ icon: IconFirstAidKit, label: 'Helpdesk', slug: 'helpdesk', color: 'teal' },
	{ icon: IconWorld, label: 'Website', slug: 'website', color: 'cyan' },
	{ icon: IconBook, label: 'eLearning', slug: 'elearning', color: 'blue' },
	{ icon: IconHeart, label: 'Social Marketing', slug: 'social-marketing', color: 'red' },
	{ icon: IconMailShare, label: 'Marketing Automation', slug: 'marketing-automation', color: 'blue' },
	{ icon: IconBrandCampaignmonitor, label: 'Email Marketing', slug: 'email-marketing', color: 'indigo' },
	{ icon: IconChartDots, label: 'SMS Marketing', slug: 'sms-marketing', color: 'cyan' },
	{ icon: IconFlame, label: 'Events', slug: 'events', color: 'orange' },
	{ icon: IconForms, label: 'Surveys', slug: 'surveys', color: 'blue' },
	{ icon: IconCreditCard, label: 'Purchase', slug: 'purchase', color: 'teal' },
	{ icon: IconBox, label: 'Inventory', slug: 'inventory', color: 'orange' },
	{ icon: IconBuildingFactory, label: 'Manufacturing', slug: 'manufacturing', color: 'cyan' },
	{ icon: IconCertificate, label: 'Quality', slug: 'quality', color: 'violet' },
	{ icon: IconBarcode, label: 'Barcode', slug: 'barcode', color: 'grape' },
	{ icon: IconTool, label: 'Maintenance', slug: 'maintenance', color: 'blue' },
	{ icon: IconHammer, label: 'Repairs', slug: 'repairs', color: 'teal' },
	{ icon: IconUserCircle, label: 'PLM', slug: 'plm', color: 'indigo' },
	{ icon: IconUserSquare, label: 'Employees', slug: 'employees', color: 'violet' },
	{ icon: IconReceipt2, label: 'Payroll', slug: 'payroll', color: 'grape' },
	{ icon: IconStars, label: 'Appraisals', slug: 'appraisals', color: 'orange' },
	{ icon: IconCoins, label: 'Attendances', slug: 'attendances', color: 'yellow' },
	{ icon: IconSearch, label: 'Recruitment', slug: 'recruitment', color: 'teal' },
	{ icon: IconArrowBack, label: 'Referrals', slug: 'referrals', color: 'pink' },
	{ icon: IconClockPause, label: 'Time Off', slug: 'time-off', color: 'orange' },
	{ icon: IconReceipt2, label: 'Expenses', slug: 'expenses', color: 'blue' },
];
