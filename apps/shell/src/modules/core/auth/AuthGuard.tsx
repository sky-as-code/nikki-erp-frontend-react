import { useEffect } from 'react';

import { useAuth } from '@modules/core/auth/AuthProvider';
import { useRouter } from '@tanstack/react-router';

type AuthGuardProps = {
	children: React.ReactNode;
};

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
	const { isAuthenticated } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isAuthenticated) {
			const pathname = window.location.pathname;
			const returnUrl = encodeURIComponent(pathname);
			console.log('Not authenticated, redirecting to login...');

			router.navigate({
				to: '/login',
				search: { to: returnUrl },
			});
		}
	}, [isAuthenticated]);

	if (!isAuthenticated) {
		return null;
	}

	return <>{children}</>;
};
