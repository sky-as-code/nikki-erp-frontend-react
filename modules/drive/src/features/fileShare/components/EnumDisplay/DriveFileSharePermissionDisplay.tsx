import { Group, Text, type TextProps } from '@mantine/core';
import {
	IconEye,
	IconEyeDown,
	IconPencil,
	IconPencilDown,
	IconShield,
	IconShieldDown,
	IconUser,
	IconUserDown,
} from '@tabler/icons-react';
import React from 'react';

import { useDriveFileSharePermissionValue } from '../../hooks/enum/useDriveFileSharePermissionValue';
import { DriveFileSharePermission } from '../../type';


const TABLER_ICON_SIZE = 18;

export const PERMISSION_ICON: Record<DriveFileSharePermission, React.ReactNode> = {
	[DriveFileSharePermission.VIEW]: (
		<IconEye
			color='var(--mantine-color-cyan-9)'
			stroke={2.5}
			size={TABLER_ICON_SIZE}
		/>
	),
	[DriveFileSharePermission.INHERITED_VIEW]: (
		<IconEyeDown
			color='var(--mantine-color-cyan-5)'
			stroke={2.5}
			size={TABLER_ICON_SIZE}
		/>
	),
	[DriveFileSharePermission.EDIT]: (
		<IconPencil
			color='var(--mantine-color-yellow-9)'
			stroke={2.5}
			size={TABLER_ICON_SIZE}
		/>
	),
	[DriveFileSharePermission.INHERITED_EDIT]: (
		<IconPencilDown
			color='var(--mantine-color-yellow-5)'
			stroke={2.5}
			size={TABLER_ICON_SIZE}
		/>
	),
	[DriveFileSharePermission.EDIT_TRASH]: (
		<IconShield
			color='var(--mantine-color-orange-9)'
			stroke={2.5}
			size={TABLER_ICON_SIZE}
		/>
	),
	[DriveFileSharePermission.INHERITED_EDIT_TRASH]: (
		<IconShieldDown
			color='var(--mantine-color-orange-5)'
			stroke={2.5}
			size={TABLER_ICON_SIZE}
		/>
	),
	[DriveFileSharePermission.OWNER]: (
		<IconUser
			color='var(--mantine-color-teal-9)'
			stroke={2.5}
			size={TABLER_ICON_SIZE}
		/>
	),
	[DriveFileSharePermission.ANCESTOR_OWNER]: (
		<IconUserDown
			color='var(--mantine-color-teal-5)'
			stroke={2.5}
			size={TABLER_ICON_SIZE}
		/>
	),
};

export type DriveFileSharePermissionDisplayProps = {
	e: DriveFileSharePermission;
	labelSuffix?: React.ReactNode;
	textProps?: Pick<TextProps, 'size' | 'fw' | 'style'>;
};

export function DriveFileSharePermissionDisplay({
	e,
	labelSuffix,
	textProps,
}: DriveFileSharePermissionDisplayProps): React.ReactNode {
	const value = useDriveFileSharePermissionValue();
	const label = value(e);

	return (
		<Group gap={6} wrap='nowrap'>
			{PERMISSION_ICON[e]}
			<Text size='sm' {...textProps}>
				{label}
				{labelSuffix}
			</Text>
		</Group>
	);
}
