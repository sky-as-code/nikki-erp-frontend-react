'use client';

import { DirectionProvider, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';

import { theme } from '@/styles/theme';


export type UIProvidersProps = React.PropsWithChildren & {
};

export const UIProviders: React.FC<UIProvidersProps> = ({children}) => {
	return (
		<DirectionProvider>
			<MantineProvider theme={theme}>
				<ModalsProvider>
					{children}
				</ModalsProvider>
			</MantineProvider>
		</DirectionProvider>
	);
};
