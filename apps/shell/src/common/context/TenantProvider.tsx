'use client';

import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect } from 'react';

import { useConfig } from '@/modules/core/ConfigProvider/ConfigProvider';


type TenantContextType = {
	subdomain: string | null;
	org: string | null;
	setOrg: (org: string) => void;
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
	const context = useContext(TenantContext);
	if (!context) throw new Error('useTenant must be used within TenantProvider');
	return context;
};

export type TenantProviderProps = React.PropsWithChildren & {
};

export const TenantProvider: React.FC<TenantProviderProps> = ({
	children,
}) => {
	const fullPath = window.location.pathname;
	const router = useRouter();
	const { envVars, setOrg } = useConfig();
	const appPath = AppPath.fromFullPath(fullPath, envVars.ROOT_PATH);

	const subdomain = extractAndValidateSubdomain(envVars.ROOT_DOMAIN, router);
	const ctxVal = {
		subdomain,
		org: appPath.orgSlug,
		setOrg: redirectToOrgPage(appPath),
	};

	useEffect(() => {
		setOrg(appPath.orgSlug);
	}, []);

	return (
		<TenantContext.Provider value={ctxVal}>
			{children}
		</TenantContext.Provider>
	);
};

function extractAndValidateSubdomain(
	rootHostname: string,
	router: ReturnType<typeof useRouter>,
) {
	const hostname = window.location.hostname;
	const subdomain = extractSubdomain(hostname, rootHostname);

	if (subdomain === null) {
		const hostnameUri = encodeURIComponent(hostname);
		// TODO: Show error saying that root domain config is wrong.
		router.push(`/error/invalid-domain?hostname=${hostnameUri}`);
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
function extractSubdomain(hostname: string, rootHostname: string): string | null {
	const isCustomDomain = (hostname === rootHostname);
	if (isCustomDomain) return hostname;

	rootHostname = `.${rootHostname}`;
	const isSaasTenant = hostname.endsWith(rootHostname);
	if (isSaasTenant) {
		const subdomain = hostname.replace(rootHostname, '');
		return subdomain;
	}
	return null;
}

function redirectToOrgPage(appPath: AppPath) {
	return (orgSlug: string | null) => {
		if (!orgSlug || orgSlug === appPath.orgSlug) return;

		const newPath = appPath.clone();
		newPath.orgSlug = orgSlug;

		// Do a full reload to new path
		location.assign(newPath.toString());
	};
};

class AppPath {
	static fromFullPath(fullPath: string, rootPath: string): AppPath {
		if (!fullPath.startsWith(rootPath)) {
			throw new Error('Application base path must match env var ROOT_PATH');
		}
		fullPath = fullPath.replace(rootPath, '');
		const parts = fullPath.split('/').filter(Boolean);
		const appPath = new AppPath(rootPath, parts[0], '');		
		if (parts.length > 1) {
			appPath.modulePath = parts.slice(1).join('/');
		}
		return appPath;
	}

	constructor(
		public rootPath: string,
		public orgSlug: string,
		public modulePath: string,
	) {}

	public clone(): AppPath {
		return new AppPath(this.rootPath, this.orgSlug, this.modulePath);
	}

	public toString(): string {
		return [this.rootPath, this.orgSlug, this.modulePath].filter(Boolean).join('/');
	}
}
