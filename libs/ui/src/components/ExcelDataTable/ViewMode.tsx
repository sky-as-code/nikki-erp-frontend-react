import { Button as MantineButton, Menu, Tooltip } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import React from 'react';

import { useExcelDataTableContext } from './context';
import { Button } from '../Button';

import type { ExcelViewMode } from './types';


export type ViewModeButtonProps = {
	mode: ExcelViewMode,
	label: string,
	icon?: React.ReactNode,
	/** Icon only, with the label as tooltip and `aria-label`. Default true. */
	iconOnly?: boolean,
};

/** One switch in a `ViewModeButtons` group; applies immediately, it is a view switch not a setting. */
export function ViewModeButton({ mode, label, icon, iconOnly = true }: ViewModeButtonProps) {
	const { viewMode, setViewMode, tid } = useExcelDataTableContext();
	const isActive = viewMode === mode;
	const button = (
		<Button
			variant={isActive ? 'filled' : 'outline'}
			aria-label={iconOnly ? label : undefined}
			aria-pressed={isActive}
			leftSection={iconOnly ? undefined : icon}
			onClick={() => setViewMode(mode)}
			{...tid.viewMode(mode)}
		>
			{iconOnly ? icon : label}
		</Button>
	);
	return iconOnly ? <Tooltip label={label}>{button}</Tooltip> : button;
}

export type ViewModeButtonsProps = { children?: React.ReactNode };

/**
 * Houses `ViewModeButton`s as one group. On a compact screen it folds into a single button that
 * shows the current mode's icon and opens a menu of `<icon> <label>` items.
 */
export function ViewModeButtons({ children }: ViewModeButtonsProps) {
	const { isCompact } = useExcelDataTableContext();
	if (!isCompact) {
		return <MantineButton.Group>{children}</MantineButton.Group>;
	}
	return <ViewModeMenu options={collectViewModeOptions(children)} />;
}

function ViewModeMenu({ options }: { options: ViewModeButtonProps[] }) {
	const { viewMode, setViewMode, tid } = useExcelDataTableContext();
	const current = options.find(option => option.mode === viewMode) ?? options[0];
	if (!current) {
		return null;
	}
	return (
		<Menu shadow='md' position='bottom-end'>
			<Menu.Target>
				<Button aria-label={current.label} rightSection={<IconChevronDown size={14} />} {...tid.viewModeMenu()}>
					{current.icon ?? current.label}
				</Button>
			</Menu.Target>
			<Menu.Dropdown>
				{options.map(option => (
					<Menu.Item
						key={option.mode}
						leftSection={option.icon}
						onClick={() => setViewMode(option.mode)}
						{...tid.viewMode(option.mode)}
					>
						{option.label}
					</Menu.Item>
				))}
			</Menu.Dropdown>
		</Menu>
	);
}

/** Reads the declared `ViewModeButton`s, so the compact menu lists exactly what the group would. */
export function collectViewModeOptions(children: React.ReactNode): ViewModeButtonProps[] {
	return React.Children.toArray(children)
		.filter((child): child is React.ReactElement<ViewModeButtonProps> =>
			React.isValidElement(child) && child.type === ViewModeButton)
		.map(child => child.props);
}
