'use client';

import { TenantProvider } from '@/common/context/TenantProvider';
import { AuthGuard } from '@/modules/core/auth/AuthGuard';


const TenantRoot: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<AuthGuard>
			<TenantProvider>
				{children}
			</TenantProvider>
		</AuthGuard>
	);
};

export default TenantRoot;
