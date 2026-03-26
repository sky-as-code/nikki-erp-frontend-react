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


const ICON_SIZE_DEFAULT = 18;

const PERMISSION_ICON_COLOR: Record<DriveFileSharePermission, string> = {
	[DriveFileSharePermission.VIEW]: 'var(--mantine-color-cyan-9)',
	[DriveFileSharePermission.INHERITED_VIEW]: 'var(--mantine-color-cyan-5)',
	[DriveFileSharePermission.EDIT]: 'var(--mantine-color-yellow-9)',
	[DriveFileSharePermission.INHERITED_EDIT]: 'var(--mantine-color-yellow-5)',
	[DriveFileSharePermission.EDIT_TRASH]: 'var(--mantine-color-orange-9)',
	[DriveFileSharePermission.INHERITED_EDIT_TRASH]: 'var(--mantine-color-orange-5)',
	[DriveFileSharePermission.OWNER]: 'var(--mantine-color-teal-9',
	[DriveFileSharePermission.ANCESTOR_OWNER]: 'var(--mantine-color-teal-5)',
};

export function DriveFileSharePermissionLeadingIcon({
	size = ICON_SIZE_DEFAULT,
	permission,
}: {
	size?: number;
	permission: DriveFileSharePermission;
}): React.ReactNode {
	const common = {
		size,
		stroke: 2.5,
		color: PERMISSION_ICON_COLOR[permission],
		'aria-hidden': true as const,
	};

	switch (permission) {
		case DriveFileSharePermission.VIEW:
			return <IconEye {...common} />;
		case DriveFileSharePermission.INHERITED_VIEW:
			return <IconEyeDown {...common} />;
		case DriveFileSharePermission.EDIT:
			return <IconPencil {...common} />;
		case DriveFileSharePermission.INHERITED_EDIT:
			return <IconPencilDown {...common} />;
		case DriveFileSharePermission.EDIT_TRASH:
			return <IconShield {...common} />;
		case DriveFileSharePermission.INHERITED_EDIT_TRASH:
			return <IconShieldDown {...common} />;
		case DriveFileSharePermission.OWNER:
			return <IconUser {...common} />;
		case DriveFileSharePermission.ANCESTOR_OWNER:
			return <IconUserDown {...common} />;
		default:
			return null;
	}
}

export type DriveFileSharePermissionDisplayProps = {
	e: DriveFileSharePermission;
	iconSize?: number;
	labelSuffix?: React.ReactNode;
	textProps?: Pick<TextProps, 'size' | 'fw' | 'style'>;
};

export function DriveFileSharePermissionDisplay({
	e,
	iconSize = ICON_SIZE_DEFAULT,
	labelSuffix,
	textProps,
}: DriveFileSharePermissionDisplayProps): React.ReactNode {
	const value = useDriveFileSharePermissionValue();
	const label = value(e);

	return (
		<Group gap={6} wrap='nowrap'>
			<DriveFileSharePermissionLeadingIcon permission={e} size={iconSize} />
			<Text size='sm' {...textProps}>
				{label}
				{labelSuffix}
			</Text>
		</Group>
	);
}
