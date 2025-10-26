import { MicroAppMetadata, MicroAppShellBundle } from '@nikkierp/ui/types';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router';

import { useAuthData, useFirstOrgSlug } from './features/auth';
import { LazyMicroApp } from './features/microApp';
import { RootLayout } from './pages/RootLayout';
import './react';

import './styles/index.css';


export const AppShell: MicroAppShellBundle['AppShell'] = ({ microApps }) => {
	return (
		<ShellRoutes microApps={microApps} />
	);
};

type ShellRoutesProps = {
	microApps: MicroAppMetadata[];
};
const ShellRoutes: React.FC<ShellRoutesProps> = ({ microApps }) => {
	return (
		<Routes>
			<Route path='/' element={<RootLayout microApps={microApps} />}>
				<Route index element={
					<>
						<Link to='/essential'>Essential</Link><br/>
						<Link to='/smart'>Smart</Link><br/>
						<Link to='/login'>Login</Link><br/>
						<Link to='/:orgSlug'>:orgSlug</Link><br/>
					</>
				} />
				<Route path='essential' element={<LazyMicroApp slug='essential' />} />
				<Route path='smart' element={<SmartNavigate />} />
				<Route path='login' element={<>Login</>} />
				<Route path=':orgSlug'>
					<Route index element={<>Shell</>} />
				</Route>

				{/* <Route element={<DomainLayout />}>
					<Route index element={<ModuleListPage />} />
				</Route> */}
			</Route>
		</Routes>
	);
};

const SmartNavigate: React.FC = () => {
	const navigate = useNavigate();
	const { isAuthenticated } = useAuthData();
	const { slug: firstOrgSlug, isLoading: isLoadingFirstOrgSlug } = useFirstOrgSlug();

	if (!isAuthenticated) {
		navigate('/login');
	}
	else if (isLoadingFirstOrgSlug) {
		return (
			<>Loading user context...</>
		);
	}
	navigate(`/${firstOrgSlug}`);
};
