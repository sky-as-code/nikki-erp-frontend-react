import { Navigate, Outlet } from 'react-router';

import { useAuth } from '@/features/auth';


export const PrivateLayout: React.FC = () => {
	const { isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return <Navigate to='/login' />;
	}

	return (
		<Outlet />
	);
};