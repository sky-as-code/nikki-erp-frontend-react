import { MantineProvider } from '@mantine/core';
import React from 'react';

import { createSyncedColorSchemeManager } from './colorScheme';
import classes from './inputLabel.module.css';

import type { MantineProviderProps } from '@mantine/core';


/**
 * Inter, self-hosted (`@fontsource-variable/inter`, imported by the Shell's `styles/index.css`), then the
 * platform's own UI font for a root that does not load it.
 */
export const APP_FONT_FAMILY = "'Inter Variable', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

export type SyncedMantineProviderProps = Omit<MantineProviderProps, 'colorSchemeManager' | 'defaultColorScheme'>;

/**
 * The `MantineProvider` every React root mounts -- the Shell's and each micro-app's.
 *
 * It follows the theme the user picked wherever it was picked (see `createSyncedColorSchemeManager`),
 * and defaults to `auto`, the backend's default: on a first visit nothing is stored yet, and
 * Mantine's own default (`light`) would be written onto `<html>`, overriding a device set to dark.
 *
 * Every root gets the app font ({@link APP_FONT_FAMILY}), the one input label style (quiet, as a
 * read-only field's label, so pressing Edit changes values and not labels), and switches, checkboxes
 * and radios the hand cursor (Mantine's default is the arrow). A caller's theme still wins.
 */
export function SyncedMantineProvider(props: SyncedMantineProviderProps): React.ReactNode {
	const [manager] = React.useState(createSyncedColorSchemeManager);
	const theme = React.useMemo(() => ({
		cursorType: 'pointer' as const,
		fontFamily: APP_FONT_FAMILY,
		headings: { fontFamily: APP_FONT_FAMILY },
		...props.theme,
		components: {
			InputWrapper: { classNames: { label: classes.label } },
			...props.theme?.components,
		},
	}), [props.theme]);
	return <MantineProvider {...props} theme={theme} colorSchemeManager={manager} defaultColorScheme='auto' />;
}
