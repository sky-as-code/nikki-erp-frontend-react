import { EnvVars } from '@nikkierp/common/types';
import i18n from '@nikkierp/ui/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { Provider as ReduxProvider } from 'react-redux';

import { UIProviders } from './UIProviders';
import { store } from '../redux/store';

import { ClientConfigProvider } from '@/context/ClientConfigProvider';
import { AuthProvider } from '@/modules/core/components/auth/AuthProvider';



const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
		},
	},
});

export const ShellProviders: React.FC<React.PropsWithChildren> = ({children}) => {
	return (
		<ReduxProvider store={store}>
			<AuthProvider>
				<QueryClientProvider client={queryClient}>
					<ClientConfigProvider>
						<I18nextProvider i18n={i18n}>
							<UIProviders>
								{children}
							</UIProviders>
						</I18nextProvider>
					</ClientConfigProvider>
				</QueryClientProvider>
			</AuthProvider>
		</ReduxProvider>
	);
};
