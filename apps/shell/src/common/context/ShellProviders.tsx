'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { AuthProvider } from '@/modules/core/auth/AuthProvider';
import { ConfigProvider } from '@/modules/core/ConfigProvider';
import { EnvVars } from '@/types/envVars';



const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
		},
	},
});

export type ShellProvidersProps = React.PropsWithChildren & {
	envVars: EnvVars;
};

export const ShellProviders: React.FC<ShellProvidersProps> = ({ children, envVars }) => {
	return (
		<AuthProvider>
			<QueryClientProvider client={queryClient}>
				<ConfigProvider envVars={envVars}>
					{children}
					<ReactQueryDevtools initialIsOpen={false} />
				</ConfigProvider>
			</QueryClientProvider>
		</AuthProvider>
	);
};
