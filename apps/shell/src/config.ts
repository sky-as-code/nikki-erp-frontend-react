// This code is supposed to run on server-side. However these config will be sent to client-side,
// so DO NOT put sensitive information here.

// We don't want to use NEXT_PUBLIC_ variables so that devops on backend
// will not lock in Next-specific env vars.

import {
	IconComponents,
	IconDashboard,
	IconLock,
	IconMoodSmile,
} from '@tabler/icons-react';
import { z } from 'zod';


import type { AppConfig } from '@/types/config';
import type { NavItem } from '@/types/navItem';

let config: Readonly<AppConfig>;

export function initConfig(): Readonly<AppConfig> {
	const envSchema = z.object({SHELL_API_URL: z.string().url()});
	// const envSchema = z.object({});

	const shellCfg: AppConfig['shell'] = envSchema.parse(process.env);
	config = Object.freeze<AppConfig>({
		shell: shellCfg,
		// core: coreConfig,
	});
	return config;
}

export function getConfig(): AppConfig {
	if (!config) {
		throw new Error('Config not loaded');
	}
	return config;
}

// const coreConfig: AppConfig['core'] = cleanEnv(process.env, {
// 	CORE_API_URL: url({ default: config.SHELL_API_URL}),
// });


export const navLinks: NavItem[] = [
	{ label: 'Dashboard', icon: IconDashboard, link: '/dashboard' },

	{
		label: 'Components',
		icon: IconComponents,
		initiallyOpened: true,
		links: [
			{
				label: 'Table',
				link: '/dashboard/table',
			},
			{
				label: 'Form',
				link: '/dashboard/form',
			},
		],
	},
	{
		label: 'Inventory',
		icon: IconLock,
		initiallyOpened: false,
		links: [
			{
				label: 'Login',
				link: '/login',
			},
			{
				label: 'Register',
				link: '/register',
			},
		],
	},
	{
		label: 'Auth',
		icon: IconLock,
		initiallyOpened: true,
		links: [
			{
				label: 'Login',
				link: '/login',
			},
			{
				label: 'Register',
				link: '/register',
			},
		],
	},
	{
		label: 'Sample',
		icon: IconMoodSmile,
		initiallyOpened: true,
		links: [
			{
				label: 'Landing',
				link: '/',
			},
			{
				label: 'Landing',
				link: '/',
			},
			{
				label: 'Landing',
				link: '/',
			},
			{
				label: 'Landing',
				link: '/',
			},
			{
				label: 'Landing',
				link: '/',
			},
			{
				label: 'Landing',
				link: '/',
			},
			{
				label: 'Landing',
				link: '/',
			},
			{
				label: 'Landing',
				link: '/',
			},
			{
				label: 'Landing',
				link: '/',
			},
			{
				label: 'Landing',
				link: '/',
			},
			{
				label: 'Landing',
				link: '/',
			},
			{
				label: 'Landing',
				link: '/',
			},
			{
				label: 'Landing',
				link: '/',
			},
			{
				label: 'Landing',
				link: '/',
			},
			{
				label: 'Landing',
				link: '/',
			},
		],
	},
];
