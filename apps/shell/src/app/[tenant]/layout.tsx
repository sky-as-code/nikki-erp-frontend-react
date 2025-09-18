'use client';

import { TenantUrlProvider } from '@/common/context/TenantUrlProvider';
import { AuthGuard } from '@/modules/authenticate/components/AuthGuard';


const TenantRoot: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<AuthGuard>
			<TenantUrlProvider>
				{children}
			</TenantUrlProvider>
		</AuthGuard>
	);
};

export default TenantRoot;
