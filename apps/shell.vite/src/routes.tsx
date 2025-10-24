// import { WebComponentWrapper } from '@nikkierp/ui/components';
// import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

// import { DomainLayout } from './pages/authorized/DomainLayout/DomainLayout';
import { RootLayout } from './pages/RootLayout';

// import { ModuleListPage } from '@/pages/authorized/ModuleListPage/ModuleListPage';

// import AuthLayout from '@/pages/public/AuthLayout';


// const moduleRoutesMap: Record<string, React.LazyExoticComponent<React.FC>> = {
// 	authenticate: lazy(() => import('@/modules/authenticate/routes')),
// 	identity: lazy(() => import('@/modules/identity/routes')),
// };

// const webComponentModules: Record<string, () => Promise<any>> = {
// 	identity: () => import('@/modules/identity/entry'),
// };

export const ShellRoutes: React.FC = () => {
	return (
		<Routes>
			<Route path='/' element={<RootLayout />}>
				<Route element={<DomainLayout />}>
					<Route index element={<ModuleListPage />} />

					{/* {Object.entries(moduleRoutesMap).map(([moduleName, ModuleRoutes]) => (
						<Route
							key={moduleName}
							path={`${moduleName}/*`}
							element={
								<Suspense fallback={<div>Loading...</div>}>
									<ModuleRoutes />
								</Suspense>
							}
						/>
					))} */}

					{/* {Object.keys(webComponentModules).map((moduleName) => (
						<Route
							key={moduleName}
							path={`${moduleName}/*`}
							element={<WebComponentWrapper
								moduleName='nikkiapp-identity'
								importFn={webComponentModules[moduleName]}
							/>}
						/>
					))} */}
				</Route>
			</Route>
		</Routes>
	);
};
