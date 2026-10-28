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
 *
 * Switches, checkboxes and radios get the hand cursor in every root; Mantine's default is the arrow.
 * A caller's theme still wins.
 */
export function SyncedMantineProvider(props: SyncedMantineProviderProps): React.ReactNode {
	const [manager] = React.useState(createSyncedColorSchemeManager);
	const theme = React.useMemo(() => ({ cursorType: 'pointer' as const, ...props.theme }), [props.theme]);
	return <MantineProvider {...props} theme={theme} colorSchemeManager={manager} defaultColorScheme='auto' />;
}
