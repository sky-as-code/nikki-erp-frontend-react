import { GLOBAL_CONTEXT_SLUG } from '@nikkierp/shell/constants';
import { LazyMicroApp } from '@nikkierp/shell/microApp';
import {
	useFindMyModule,
	useFindMyOrg,
	useMyModulesForContext,
	useUserContext,
} from '@nikkierp/shell/userContext';
import { useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';
import { MicroAppMetadata } from '@nikkierp/ui/microApp';
import { Navigate, useParams } from 'react-router';

import { AppLoading } from './Loading';


export function LazyModule({ microApps }: { microApps: MicroAppMetadata[] }): React.ReactNode {
	const { moduleSlug, orgSlug } = useParams();
	const { orgSlug: activeOrgSlug } = useActiveOrgModule();
	const { isLoading, user } = useUserContext();
	const resolvedOrgSlug = orgSlug ?? activeOrgSlug ?? null;

	const isGlobalContext = resolvedOrgSlug === GLOBAL_CONTEXT_SLUG;
	const contextModules = useMyModulesForContext(resolvedOrgSlug);
	const orgModule = useFindMyModule(resolvedOrgSlug ?? '', moduleSlug!);

	const foundModule = isGlobalContext
		? contextModules.find((mod) => mod.slug === moduleSlug) ?? null
		: orgModule;
	const foundApp = microApps.find(app => app.basePath === moduleSlug);

	const isLoadingApp = isLoading || !user || !resolvedOrgSlug;
	if (isLoadingApp) {
		return <AppLoading />;
	}

	if (!foundModule || !foundApp) {
		return <Navigate to='/notfound' replace />;
	}

	return (
		<LazyMicroApp
			key={foundApp.slug}
			slug={foundApp.slug}
			basePath={foundApp.basePath}
			fallback={<AppLoading />}
		/>
	);
}