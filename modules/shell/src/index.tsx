import { MicroAppMetadata } from '@nikkierp/common/types';
import { Navigate, Route, Routes } from 'react-router';

import { useAuthData, useFirstOrgSlug } from './features/auth';
import { RootLayout } from './pages/RootLayout';

import './styles/index.css';


export type ShellRoutesProps = {
	remoteApps: MicroAppMetadata[];
};

export const ShellRoutes: React.FC<ShellRoutesProps> = ({ remoteApps }) => {
	return (
		<Routes>
			<Route path='/' element={<RootLayout remoteApps={remoteApps} />}>
				<Route index element={<SmartNavigate />} />
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
	const { isAuthenticated } = useAuthData();
	const { slug: firstOrgSlug, isLoading: isLoadingFirstOrgSlug } = useFirstOrgSlug();

	if (!isAuthenticated) {
		return <Navigate to='/login' />;
	}
	else if (isLoadingFirstOrgSlug) {
		return (
			<>Loading user context...</>
		);
	}
	return <Navigate to={`/${firstOrgSlug}`} />;
};
