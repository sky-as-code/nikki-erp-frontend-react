
import { useRouter, useRouterState } from '@tanstack/react-router'
import { useEffect } from 'react'

import { useAuth } from '@/modules/core/components/auth/AuthProvider'

type AuthGuardProps = {
	children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
	const { isAuthenticated } = useAuth()
	const router = useRouter()

	const routerState = useRouterState()
	const pathname = routerState.location.pathname

	useEffect(() => {
		if (!isAuthenticated) {
			const returnUrl = (pathname && pathname !== '/undefined') ? encodeURIComponent(pathname) : null

			router.navigate({
				to: '/login',
				search: returnUrl ? { to: returnUrl } : null,
			})
		}
	}, [isAuthenticated])

	if (!isAuthenticated) {
		return null
	}

	return <>{children}</>
}
