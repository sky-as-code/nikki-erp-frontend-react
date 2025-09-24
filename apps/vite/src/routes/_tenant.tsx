import { TenantUrlProvider } from '@/common/context/TenantUrlProvider';
import { AuthGuard } from '@/modules/core/auth/AuthGuard';
import { createFileRoute, Outlet } from '@tanstack/react-router';


const TenantRoot: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<AuthGuard>
			<TenantUrlProvider>{children}</TenantUrlProvider>
		</AuthGuard>
	)
};

export const Route = createFileRoute('/_tenant')({
		component: () => (
		  <TenantRoot>
			<Outlet />
		  </TenantRoot>
		),
})
