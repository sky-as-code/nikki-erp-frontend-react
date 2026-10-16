import { MantineProvider } from '@mantine/core';
import React from 'react';

import { createSyncedColorSchemeManager } from './colorScheme';

import type { MantineProviderProps } from '@mantine/core';


export type SyncedMantineProviderProps = Omit<MantineProviderProps, 'colorSchemeManager' | 'defaultColorScheme'>;

/**
 * The `MantineProvider` every React root mounts -- the Shell's and each micro-app's.
 *
 * It follows the theme the user picked wherever it was picked (see `createSyncedColorSchemeManager`),
 * and defaults to `auto`, the backend's default: on a first visit nothing is stored yet, and
 * Mantine's own default (`light`) would be written onto `<html>`, overriding a device set to dark.
 */
export function SyncedMantineProvider(props: SyncedMantineProviderProps): React.ReactNode {
	const [manager] = React.useState(createSyncedColorSchemeManager);
	return <MantineProvider {...props} colorSchemeManager={manager} defaultColorScheme='auto' />;
}
