import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { UIProviders } from './UIProviders'

import { ConfigProvider } from '@/common/context/ConfigProvider'
import { EnvVars } from '@/common/types/envVars'
import { AuthProvider } from '@/modules/core/components/auth/AuthProvider'

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
		},
	},
})

export type ShellProvidersProps = React.PropsWithChildren & {
	envVars: EnvVars;
}

export const ShellProviders: React.FC<ShellProvidersProps> = ({
	children,
	envVars,
}) => {
	return (
		<AuthProvider>
			<QueryClientProvider client={queryClient}>
				<ConfigProvider envVars={envVars}>
					<UIProviders>
						{children}
					</UIProviders>
				</ConfigProvider>
			</QueryClientProvider>
		</AuthProvider>
	)
}
