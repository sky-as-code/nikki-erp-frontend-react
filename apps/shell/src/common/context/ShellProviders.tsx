import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ConfigProvider } from '@/common/context/ConfigProvider'
import { AuthProvider } from '@/modules/core/components/auth/AuthProvider'
import { EnvVars } from '@/types/envVars'

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
					{children}
					{/* <ReactQueryDevtools initialIsOpen={false} /> */}
				</ConfigProvider>
			</QueryClientProvider>
		</AuthProvider>
	)
}
