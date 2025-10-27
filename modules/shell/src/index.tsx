import { MantineProvider, Paper } from '@mantine/core';
import { MicroAppMetadata, MicroAppShellBundle } from '@nikkierp/ui/microApp';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';

import { useAuthData, useFirstOrgSlug } from './features/auth';
import { LazyMicroApp, LazyMicroWidget } from './features/microApp';
import { RootLayout } from './pages/RootLayout';

import './react';

import './styles/index.css';


export const AppShell: MicroAppShellBundle['AppShell'] = ({ microApps }) => {
	return (
		<>
			<ShellRoutes microApps={microApps} />
		</>
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
						<Link to='/someorg'>:orgSlug</Link><br/>
						<Link to='/someorg/sub'>:orgSlug/sub</Link><br/>
					</>
				} />
				<Route path='essential/*' element={<EssentialTest />} />
				<Route path='smart' element={<SmartNavigate />} />
				<Route path='login' element={<>Login</>} />
				<Route path=':orgSlug'>
					<Route index element={<OrgSub />} />
					<Route path='sub'>
						<Route index element={<OrgSub />} />
					</Route>
				</Route>

				{/* <Route element={<DomainLayout />}>
					<Route index element={<ModuleListPage />} />
				</Route> */}
			</Route>
		</Routes>
	);
};

const OrgSub: React.FC = () => {
	const location = useLocation();
	return (
		<b>{location.pathname}</b>
	);
};


const EssentialTest: React.FC = () => {
	return (
		<>
			<Paper shadow='xs' p='xl'>
				<LazyMicroWidget slug='essential' widgetName='org-home' />
			</Paper>
			{/* <LazyMicroApp slug='essential' basePath='essential' /> */}
		</>
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
