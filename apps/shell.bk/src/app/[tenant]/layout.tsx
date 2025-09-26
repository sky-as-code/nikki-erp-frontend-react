'use client'

import { TenantUrlProvider } from '@/common/context/TenantUrlProvider'
import { AuthGuard } from '@/modules/core/auth/AuthGuard'

const TenantRoot: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<AuthGuard>
			<TenantUrlProvider>{children}</TenantUrlProvider>
		</AuthGuard>
	)
}

export default TenantRoot
