import { AuthGuard } from '@/modules/core/components/auth/AuthGuard';
import { TenantUrlProvider } from '@/modules/core/context/TenantUrlProvider';

export const TenantLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<AuthGuard>
			<TenantUrlProvider>
				{children}
			</TenantUrlProvider>
		</AuthGuard>
	);
};



