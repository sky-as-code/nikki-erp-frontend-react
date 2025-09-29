// DO NOT LOAD SENSITIVE INFORMATION HERE!
// This code is supposed to run on server-side. However these env vars will be sent to client-side,

// We don't want to use NEXT_PUBLIC_ variables so that devops on backend
// will not lock in Next-specific env vars.

import {
	IconComponents,
	IconDashboard,
	IconLock,
	IconMoodSmile,
} from '@tabler/icons-react'
import { z } from 'zod'

import { EnvVars } from './types/envVars'

import type { NavItem } from '@/common/types/navItem'

const envVarPrefix = 'NIKKI_PUBLIC_'

let envVars: Readonly<EnvVars>

/**
 * Loads configuration from backend environment variables.
 * This function must be invoked by a SSR-ed component.
 * It only loads MFE Shell configs which, by conventions, are prefixed with `SHELL_`.
 */
export async function loadEnvVars(): Promise<Readonly<EnvVars>> {
	if (envVars) return envVars

	const envSchema = z.object({
		BASE_API_URL: z.string().url(),
		ROOT_PATH: z
			.string()
			.regex(/^(\/?[a-zA-Z0-9\-._~%!$&'()*+,;=:@]+)*\/?$/)
			.optional()
			.default('')
			.transform((val) => {
				if (val === '' || val === '/') return ''
				// Add starting slash if not present,
				// remove trailing slash if any
				return `/${val.replace(/^\/|\/$/g, '')}`
			}),
		ROOT_DOMAIN: z.union([
			z.literal('localhost'),
			z
				.string()
				.regex(
					/^(?=.{1,253}$)(?!.*[-]{2,})(?!.*\.-)(?!.*-\.)((?!-)[a-zA-Z0-9-]{1,63}(?<!-)\.)+[a-zA-Z]{2,63}$/
				),
		]),
	})

	const res = await fetch('/api/config')
	const raw = await res.json()

	const parsed = envSchema.parse(raw)
	envVars = Object.freeze<EnvVars>(parsed)
	return envVars
}

function filterEnvVars(rawEnvs: Record<string, string>) {
	return Object.fromEntries(
		Object.entries(rawEnvs)
			.filter(([key]) => key.startsWith(envVarPrefix))
			.map(([key, value]) => [key.replace(envVarPrefix, ''), value])
	)
}

export const navLinks: NavItem[] = [
	{
		label: 'Dashboard',
		icon: IconDashboard,
		link: '/dashboard',
	},

	{
		label: 'Components',
		icon: IconComponents,
		items: [
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
		items: [
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
		items: [
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
		items: [
			{
				label: 'Landing 1',
				link: '/',
			},
			{
				label: 'Landing 2',
				link: '/',
			},
			{
				label: 'Landing 3',
				link: '/',
			},
			{
				label: 'Landing 4',
				link: '/',
			},
			{
				label: 'Landing 5',
				link: '/',
			},
			{
				label: 'Landing 6',
				link: '/',
			},
			{
				label: 'Landing 7',
				link: '/',
			},
			{
				label: 'Landing 8',
				link: '/',
			},
			{
				label: 'Landing 9',
				link: '/',
			},
			{
				label: 'Landing 10',
				link: '/',
			},
		],
	},
]
