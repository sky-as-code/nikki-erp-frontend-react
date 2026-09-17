import { moduleService, SearchModuleResponse } from '@nikkierp/shell/erpModules';
import { LazyMicroApp } from '@nikkierp/shell/microApp';
import { useServiceLayer } from '@nikkierp/ui/appState/store';
import { MicroAppMetadata } from '@nikkierp/ui/microApp';
import React from 'react';
import { Route, Routes, useParams } from 'react-router';

// import { LazyModule } from '../components/LazyModule';
import { AppLoading } from '../components/Loading';
import { ModuleSubLayout } from '../layouts/ModuleSubLayout';
import { OrgSubLayout } from '../layouts/OrgSubLayout';
import { PrivateLayout } from '../layouts/PrivateLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import { ModuleHomePage } from '../pages/ModuleHomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { SignInPage } from '../pages/SignInPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';


type ShellRoutesProps = {
	microApps: MicroAppMetadata[],
};

export function ShellRoutes(props: ShellRoutesProps): React.ReactNode {
	return (
		<Routes>
			<Route element={<PublicLayout />}>
				<Route path='signin' element={<SignInPage />} />
				<Route path='notfound' element={<NotFoundPage />} />
				<Route path='unauthorized' element={<UnauthorizedPage />} />
			</Route>


			{/* The organization is no longer a URL segment: it is resolved from storage and
				validated against the user's org list, so `/` is org home and every module hangs
				directly off it. `OrgSubLayout` still gates the tree on an org being resolved. */}
			<Route element={<PrivateLayout />}>
				<Route element={<OrgSubLayout />}>
					<Route element={<ModuleSubLayout />}>
						<Route index element={<ModuleHomePage />} />
						<Route path=':moduleSlug/*' element={<LazyModule microApps={props.microApps} />} />
						{/* Keeps the org chrome around an unknown path. */}
						<Route path='*' element={<NotFoundPage />} />
					</Route>
				</Route>
			</Route>
		</Routes>
	);
}

function LazyModule(props: { microApps: MicroAppMetadata[] }): React.ReactNode {
	const { moduleSlug } = useParams();
	const { result, data } = useServiceLayer<SearchModuleResponse>(
		moduleService.listAll, undefined, { dispatchOnMount: true },
	);

	if (result.isPending) {
		return <AppLoading />;
	}
	else if (result.isRejected) {
		console.error(result.error);
		// Rendered in place rather than redirected, so the URL still names the module that could
		// not be loaded.
		return <NotFoundPage />;
	}
	else if (result.isSuccess) {
		const isBackendModule = data!.items.some(module => module.name === moduleSlug);
		const foundApp = props.microApps.find(app => app.slug === moduleSlug);
		if (!isBackendModule || !foundApp) {
			return <NotFoundPage />;
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
}