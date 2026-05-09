import { useListAllModules, ModuleDispatch } from '@nikkierp/shell/erpModules';
import { LazyMicroApp } from '@nikkierp/shell/microApp';
import { MicroAppMetadata } from '@nikkierp/ui/microApp';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, Routes, useParams } from 'react-router';

// import { LazyModule } from '../components/LazyModule';
import { AppLoading } from '../components/Loading';
import { ToDefaultOrg } from '../components/ToDefaultOrg';
import { ModuleSubLayout } from '../layouts/ModuleSubLayout';
import { OrgSubLayout } from '../layouts/OrgSubLayout';
import { PrivateLayout } from '../layouts/PrivateLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import { ModuleHomePage } from '../pages/ModuleHomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { SignInPage } from '../pages/SignInPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';


type ShellRoutesProps = {
	microApps: MicroAppMetadata[];
};

export function ShellRoutes(props: ShellRoutesProps): React.ReactNode {
	return (
		<Routes>
			<Route element={<PublicLayout />}>
				<Route path='signin' element={<SignInPage />} />
				<Route path='notfound' element={<NotFoundPage />} />
				<Route path='unauthorized' element={<UnauthorizedPage />} />
			</Route>


			<Route element={<PrivateLayout />}>
				<Route path='/' element={<ToDefaultOrg />} />
				<Route element={<OrgSubLayout />}>
					<Route path=':orgSlug'>
						<Route element={<ModuleSubLayout />}>
							<Route index element={<ModuleHomePage />} />
							<Route path=':moduleSlug/*' element={<LazyModule microApps={props.microApps} />} />
						</Route>
					</Route>
				</Route>
			</Route>
		</Routes>
	);
}

function LazyModule(props: { microApps: MicroAppMetadata[] }): React.ReactNode {
	const { moduleSlug } = useParams();
	const listAll = useListAllModules();
	const dispatch = useDispatch<ModuleDispatch>();

	React.useEffect(() => {
		dispatch(listAll.thunkAction());
	}, []);

	if (listAll.isLoading) {
		return <AppLoading />;
	}
	else if (listAll.isError) {
		console.error(listAll.error);
		return <Navigate to='/notfound' replace />;
	}
	else if (listAll.isDone) {
		const isBackendModule = listAll.data!.items.some(module => module.name === moduleSlug);
		const foundApp = props.microApps.find(app => app.slug === moduleSlug);
		if (!isBackendModule || !foundApp) {
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
}