import { MicroAppMetadata } from '@nikkierp/ui/microApp';
import { Route, Routes } from 'react-router';

import { LazyModule } from '../components/LazyModule';
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