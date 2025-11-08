import { MantineProvider, Paper } from '@mantine/core';
import { useAuthData, useFirstOrgSlug } from '@nikkierp/shell/auth';
import { ShellProviders } from '@nikkierp/shell/contexts';
import { LazyMicroApp, LazyMicroWidget } from '@nikkierp/shell/microApp';
import { MicroAppMetadata, MicroAppShellBundle } from '@nikkierp/ui/microApp';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';

import { UIProviders } from './context/UIProviders';
import { RootLayout } from './layout/RootLayout';
import { SignInPage } from './pages/public/SignInPage';

import './react';

import './styles/index.css';


type ShellWindow = typeof window & {
	/** Config object injected by shellbff */
	__CLIENT_CONFIG__: Record<string, unknown>;
};

export const MicroAppShell: MicroAppShellBundle['MicroAppShell'] = ({ microApps }) => {
	return (
		<ShellProviders
			microApps={microApps}
			envVars={(window as ShellWindow).__CLIENT_CONFIG__}
		>
			<UIProviders>
				<ShellRoutes microApps={microApps} />
			</UIProviders>
		</ShellProviders>
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
						<Link to='/essential'>Essential</Link><br />
						<Link to='/identity'>
							<div className='text-blue-500 py-4 border-b border-blue-500'>Identity</div>
						</Link>
						<Link to='/smart'>Smart</Link><br />
						<Link to='/login'>Login</Link><br />
						<Link to='/someorg'>:orgSlug</Link><br />
						<Link to='/someorg/sub'>:orgSlug/sub</Link><br />
					</>
				} />
				<Route path='essential/*' element={<EssentialTest />} />
				<Route path='identity/*' element={<IdentityTest />} />
				<Route path='smart' element={<SmartNavigate />} />
				<Route path='signin' element={<SignInPage />} />
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
				<LazyMicroWidget slug='nikkierp.essential' widgetName='module-management' />
			</Paper>
			<LazyMicroApp slug='nikkierp.essential' basePath='essential' />
		</>
	);
};

const IdentityTest: React.FC = () => {
	return (
		<>
			<Paper shadow='xs' p='xl'>
				<LazyMicroApp slug='nikkierp.identity' basePath='identity' />
			</Paper>
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
