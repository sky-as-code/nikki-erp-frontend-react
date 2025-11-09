import { Center, Paper, Stack, Text } from '@mantine/core';
import { ShellProviders } from '@nikkierp/shell/contexts';
import { LazyMicroApp, LazyMicroWidget } from '@nikkierp/shell/microApp';
import { useFindMyModule, useFindMyOrg, useFirstOrgSlug } from '@nikkierp/shell/userContext';
import { setActiveModuleAction, setActiveOrgAction } from '@nikkierp/ui/appState/routingSlice';
import { MicroAppMetadata, MicroAppShellProps } from '@nikkierp/ui/microApp';
import { IconHomeCancel } from '@tabler/icons-react';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Link, Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router';

import { UIProviders } from './context/UIProviders';
import { PrivateLayout } from './layout/PrivateLayout';
import { PublicLayout } from './layout/PublicLayout';
import { NotFoundPage } from './pages/NotFoundPage';
import { SignInPage } from './pages/public/SignInPage';

import './styles/index.css';


type ShellWindow = typeof window & {
	/** Config object injected by shellbff */
	__CLIENT_CONFIG__: Record<string, unknown>;
};

export function MicroAppShell({ microApps }: MicroAppShellProps): React.ReactNode {
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
}

type ShellRoutesProps = {
	microApps: MicroAppMetadata[];
};

function ShellRoutes(props: ShellRoutesProps): React.ReactNode {
	return (
		<Routes>
			<Route element={<PublicLayout />}>
				<Route path='signin' element={<SignInPage />} />
				<Route path='notfound' element={<NotFoundPage />} />
			</Route>
			<Route element={<PrivateLayout />}>
				<Route path='/' element={<ToDefaultOrg />} />
				<Route element={<OrgSubLayout />}>
					<Route path=':orgSlug'>
						<Route element={<ModuleSubLayout />}>
							<Route index element={<ModuleList />} />
							<Route path=':moduleSlug/*' element={<LazyModule microApps={props.microApps} />} />
						</Route>
					</Route>
				</Route>
			</Route>
		</Routes>
	);
}

function OrgSubLayout(): React.ReactNode {
	const dispatch = useDispatch();
	const location = useLocation();
	const { orgSlug } = useParams();
	const found = useFindMyOrg(orgSlug!);

	React.useEffect(() => {
		dispatch(setActiveOrgAction(orgSlug!));
	}, [location]);

	if (found) {
		return <Outlet />;
	}
	return <Navigate to='/notfound' replace />;
}

function ModuleSubLayout(): React.ReactNode {
	const dispatch = useDispatch();
	const location = useLocation();
	const { moduleSlug } = useParams();

	React.useEffect(() => {
		dispatch(setActiveModuleAction(moduleSlug));
	}, [location]);

	return <Outlet />;
}

function LazyModule({ microApps }: { microApps: MicroAppMetadata[] }): React.ReactNode {
	const dispatch = useDispatch();
	const location = useLocation();
	const { moduleSlug } = useParams();
	const { orgSlug } = useParams();
	const foundModule = useFindMyModule(orgSlug!, moduleSlug!);
	const foundApp = microApps.find(app => app.basePath === moduleSlug);


	if (!foundModule || !foundApp) {
		return <Navigate to='/notfound' replace />;
	}

	return (
		<LazyMicroApp slug={foundApp.slug} basePath={foundApp.basePath} />
	);
}

function ModuleList(): React.ReactNode {
	return (
		<>
			<Link to='essential'>
				<div className='text-blue-500 py-4 border-b border-blue-500'>Essential</div>
			</Link><br />
			<Link to='identity'>
				<div className='text-blue-500 py-4 border-b border-blue-500'>Identity</div>
			</Link>
			<Link to='/signin'>Sign In</Link><br />
		</>
	);
}

function ToDefaultOrg(): React.ReactNode {
	const { slug: firstOrgSlug } = useFirstOrgSlug();

	return firstOrgSlug ?
		<Navigate to={`/${firstOrgSlug}`} replace /> :
		<NoOrg />;
}

function NoOrg(): React.ReactNode {
	return (
		<Center w='100%' h='90vh'>
			<Stack align='center' gap='xs'>
				<IconHomeCancel size={100} />
				<Text c='dimmed'>You don't have any organization assigned to you...</Text>
			</Stack>
		</Center>
	);
}


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
