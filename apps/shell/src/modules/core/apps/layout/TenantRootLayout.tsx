import { TenantUrlProvider } from '@/common/context/TenantUrlProvider'
import { AuthGuard } from '@/modules/core/auth/AuthGuard'

export const TenantRootLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<AuthGuard>
			<TenantUrlProvider>{children}</TenantUrlProvider>
		</AuthGuard>
	)
}