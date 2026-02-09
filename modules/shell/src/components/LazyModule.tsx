import { GLOBAL_CONTEXT_SLUG } from '@nikkierp/shell/constants';
import { LazyMicroApp } from '@nikkierp/shell/microApp';
import {
	useCanAccessModuleForContext,
	useFindMyModule,
	useFindMyOrg,
	useMyModulesForContext,
} from '@nikkierp/shell/userContext';
import { useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';
import { MicroAppMetadata } from '@nikkierp/ui/microApp';
import { Navigate, useParams } from 'react-router';

import { AppLoading } from './Loading';


export function LazyModule({ microApps }: { microApps: MicroAppMetadata[] }): React.ReactNode {
	const { moduleSlug, orgSlug } = useParams();
	const { orgSlug: activeOrgSlug } = useActiveOrgModule();
	const resolvedOrgSlug = orgSlug ?? activeOrgSlug ?? null;
	const isGlobalContext = resolvedOrgSlug === GLOBAL_CONTEXT_SLUG;
	const contextModules = useMyModulesForContext(resolvedOrgSlug);
	const orgModule = useFindMyModule(resolvedOrgSlug ?? '', moduleSlug!);
	const activeOrg = useFindMyOrg(resolvedOrgSlug ?? '');
	const orgContextScope = resolvedOrgSlug && resolvedOrgSlug !== GLOBAL_CONTEXT_SLUG
		? { scopeType: 'org' as const, scopeRef: activeOrg?.id ?? '' }
		: undefined;
	const foundModule = isGlobalContext
		? contextModules.find((mod) => mod.slug === moduleSlug) ?? null
		: orgModule;
	const foundApp = microApps.find(app => app.basePath === moduleSlug);
	const canAccess = useCanAccessModuleForContext(moduleSlug!, resolvedOrgSlug, orgContextScope);

	if (!foundApp) {
		return <Navigate to='/notfound' replace />;
	}


	// if (!foundModule || !foundApp) {
	// 	return <Navigate to='/notfound' replace />;
	// }

	// if (!canAccess) {
	// 	return <Navigate to='/unauthorized' replace />;
	// }

	return (
		<LazyMicroApp
			slug={foundApp?.slug ?? ''}
			basePath={foundApp?.basePath ?? ''}
			fallback={<AppLoading />}
		/>
	);
}