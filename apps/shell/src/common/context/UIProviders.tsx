'use client';

import { DirectionProvider, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { ContextMenuProvider } from 'mantine-contextmenu';

import { theme } from '@/styles/theme';


export type UIProvidersProps = React.PropsWithChildren & {
};

export const UIProviders: React.FC<UIProvidersProps> = ({children}) => {
	return (
		<DirectionProvider>
			<MantineProvider theme={theme} defaultColorScheme='light'>
				<ContextMenuProvider>
					<ModalsProvider>
						{children}
					</ModalsProvider>
				</ContextMenuProvider>
			</MantineProvider>
		</DirectionProvider>
	);
};
