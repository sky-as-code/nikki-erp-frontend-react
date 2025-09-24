import { Organization } from '@modules/core/types';
import React, { createContext, useContext, useEffect } from 'react';

import { useConfig } from '@/modules/core/ConfigProvider/ConfigProvider';
import { useRouter, useRouterState } from '@tanstack/react-router';

type TenantUrlContextType = {
	subdomain: string | null;
	orgSlug: string | null;
	redirectToModule: (modSlug: string) => void;
	redirectToOrg: (orgSlug: string) => void;
	getFullPath: (modulePath: string) => string;
	getOrgPath: () => string;
	getModulePath: () => string;
};

const TenantUrlContext = createContext<TenantUrlContextType | undefined>(
	undefined
);

export const useTenantUrl = () => {
	const context = useContext(TenantUrlContext);
	if (!context)
		throw new Error('useTenantUrl must be used within TenantUrlProvider');
	return context;
};

function findOrg(orgs: Organization[], slug: string): Organization | null {
	return orgs.find((org) => org.slug === slug) ?? null;
}

export type TenantUrlProviderProps = React.PropsWithChildren;

export const TenantUrlProvider: React.FC<TenantUrlProviderProps> = ({
	children,
}) => {
	// const fullPath = window.location.pathname;
	// const fullPath = usePathname();
	// const router = useRouter();
	const routerState = useRouterState();
	
	const fullPath = routerState.location.pathname
	console.debug("🚀 ~ TenantUrlProvider ~ fullPath:", fullPath)
	
	const router = useRouter();
	
	const { envVars, activeOrg, setActiveOrg, setActiveModule, userSettings } =
		useConfig();
	const appPath = AppPath.fromFullPath(fullPath, envVars.ROOT_PATH);
	console.debug("🚀 ~ TenantUrlProvider ~ appPath:", appPath)

	const subdomain = extractAndValidateSubdomain(envVars.ROOT_DOMAIN, router);
	const ctxVal: TenantUrlContextType = {
		subdomain,
		orgSlug: appPath.orgSlug,
		redirectToModule: redirectToModulePage(appPath),
		redirectToOrg: redirectToOrgPage(appPath),
		getFullPath: getFullPath(appPath),
		getOrgPath: getOrgPath(appPath),
		getModulePath: getModulePath(appPath),
	};

	useEffect(() => {
		if (!userSettings) return;

		const foundLastActiveOrg = activeOrg && activeOrg.slug != appPath.orgSlug;
		console.debug("🚀 ~ TenantUrlProvider ~ foundLastActiveOrg:", foundLastActiveOrg)
		// This case applies when user accesses root path "/"
		if (foundLastActiveOrg) {
			appPath.orgSlug = activeOrg?.slug;
			redirectToOrgPage(appPath);
		}
		// This case applies after user was redirected to org path "/org-slug",
		// either by above `redirectToOrgPage` call or by successful login.
		else if (!activeOrg) {
			// setActiveOrg(appPath.orgSlug);
			const allOrgs = userSettings?.orgs ?? [];
			const org = findOrg(allOrgs, appPath.orgSlug);
			if (!org) {
				// notFound();
				return
			}
			setActiveOrg(org.slug);
		}
	}, [userSettings]);

	useEffect(() => {
		appPath.moduleSlug && setActiveModule(appPath.moduleSlug);
	}, []);

	return (
		<TenantUrlContext.Provider value={ctxVal}>
			{activeOrg ? children : 'Loading...'}
		</TenantUrlContext.Provider>
	);
};

function extractAndValidateSubdomain(
	rootHostname: string,
	router: ReturnType<typeof useRouter>
) {
	const hostname = window.location.hostname;
	const subdomain = extractSubdomain(hostname, rootHostname);

	if (subdomain === null) {
		const hostnameUri = encodeURIComponent(hostname);
		// TODO: Show error saying that root domain config is wrong.
		// router.push(`/error/invalid-domain?hostname=${hostnameUri}`);
		console.log('Invalid domain');
		router.navigate({ to: '/error/invalid-domain', search: { hostname: hostnameUri } });
		return null;
	}
	return subdomain;
}

// For multitenant SaaS:
// * If sub.domain.com, return sub
// * If sub.domain.com.vn, return sub
// Also for multitenant SaaSFor but a tenant is using custom domain name:
// * If corporatedomain.com, return corporatedomain.com
// * If corporatedomain.com.vn, return corporatedomain.com.vn
function extractSubdomain(
	hostname: string,
	rootHostname: string
): string | null {
	const isCustomDomain = hostname === rootHostname;
	if (isCustomDomain) return hostname;

	rootHostname = `.${rootHostname}`;
	const isSaasTenant = hostname.endsWith(rootHostname);
	if (isSaasTenant) {
		const subdomain = hostname.replace(rootHostname, '');
		return subdomain;
	}
	return null;
}

function getFullPath(appPath: AppPath) {
	return (path: string): string => {
		const newPath = appPath.clone();
		return newPath.append(path);
	};
}

function getOrgPath(appPath: AppPath) {
	return (): string => {
		const newPath = appPath.clone();
		newPath.moduleSlug = '';
		return newPath.toString();
	};
}

function getModulePath(appPath: AppPath) {
	return (): string => {
		const newPath = appPath.clone();
		return newPath.toString();
	};
}

function redirectToOrgPage(appPath: AppPath) {
	return (orgSlug: string | null) => {
		if (!orgSlug || orgSlug === appPath.orgSlug) return;

		const newPath = new AppPath(appPath.rootPath, orgSlug, '');

		// Do a full reload to new path
		location.assign(newPath.toString());
	};
}

function redirectToModulePage(appPath: AppPath) {
	return (modSlug: string | null) => {
		if (!modSlug || modSlug === appPath.moduleSlug) return;

		const newPath = appPath.clone();
		newPath.moduleSlug = modSlug;

		// Do a full reload to new path
		location.assign(newPath.toString());
	};
}

class AppPath {
	static fromFullPath(fullPath: string, rootPath: string): AppPath {
		if (!fullPath.startsWith(rootPath)) {
			throw new Error('Application base path must match env var ROOT_PATH');
		}
		fullPath = fullPath.replace(rootPath, '');
		const parts = fullPath.split('/').filter(Boolean);
		const appPath = new AppPath(rootPath, parts[0], '');
		if (parts.length > 1) {
			appPath.moduleSlug = parts[1];
		}
		return appPath;
	}

	constructor(
		public rootPath: string,
		public orgSlug: string,
		public moduleSlug: string
	) {}

	public clone(): AppPath {
		return new AppPath(this.rootPath, this.orgSlug, this.moduleSlug);
	}

	public toString(): string {
		return `${this.rootPath}/${this.orgSlug}/${this.moduleSlug}`;
	}

	public append(path: string): string {
		if (path.startsWith('/')) path = path.slice(1);
		return `${this.toString()}/${path}`;
	}
}
