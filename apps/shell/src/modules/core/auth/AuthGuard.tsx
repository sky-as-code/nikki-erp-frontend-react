'use client';

import { useEffect } from 'react';

import { useAuth } from '@/modules/core/auth/AuthProvider';

type AuthGuardProps = {
	children: React.ReactNode;
};

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
	const { isAuthenticated } = useAuth();

	useEffect(() => {
		if (!isAuthenticated) {
			const pathname = window.location.pathname;
			const returnUrl = encodeURIComponent(pathname);
			window.location.assign(`/login?to=${returnUrl}`);
		}
	}, [isAuthenticated]);

	if (!isAuthenticated) {
		return null;
	}

	return <>{children}</>;
};
