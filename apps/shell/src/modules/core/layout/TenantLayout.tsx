import { TenantUrlProvider } from '@/common/context/TenantUrlProvider'
import { AuthGuard } from '@/modules/core/components/auth/AuthGuard'

export const TenantLayout: React.FC<React.PropsWithChildren> = ({ children }) => {

	return (
		<AuthGuard>
			<TenantUrlProvider>
				{children}
			</TenantUrlProvider>
		</AuthGuard>
	)
}



