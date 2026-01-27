import { LazyMicroApp } from '@nikkierp/shell/microApp';
import { useCanAccessModule, useFindMyModule } from '@nikkierp/shell/userContext';
import { MicroAppMetadata } from '@nikkierp/ui/microApp';
import { Navigate, useParams } from 'react-router';


export function LazyModule({ microApps }: { microApps: MicroAppMetadata[] }): React.ReactNode {
	const { moduleSlug, orgSlug } = useParams();
	const foundModule = useFindMyModule(orgSlug!, moduleSlug!);
	const foundApp = microApps.find(app => app.basePath === moduleSlug);
	const canAccess = useCanAccessModule(moduleSlug!);

	if (!foundModule || !foundApp) {
		return <Navigate to='/notfound' replace />;
	}

	if (!canAccess) {
		return <Navigate to='/unauthorized' replace />;
	}

	return (
		<LazyMicroApp slug={foundApp.slug} basePath={foundApp.basePath} />
	);
}