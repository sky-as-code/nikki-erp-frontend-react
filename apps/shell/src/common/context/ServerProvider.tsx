import { DirectionProvider, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';

import { ConfigProvider } from './ConfigProvider';

import { theme } from '@/styles/theme';
import type { AppConfig } from '@/types/config';

// Wraps all nested serverside providers
export const ServerProvider = ({
	children,
	config,
}: {
	children: React.ReactNode;
	config: AppConfig;
}) => {
	return (
		<ConfigProvider config={config}>
			<DirectionProvider>
				<MantineProvider theme={theme}>
					<ModalsProvider>
						{children}
					</ModalsProvider>
				</MantineProvider>
			</DirectionProvider>
		</ConfigProvider>
	);
};
