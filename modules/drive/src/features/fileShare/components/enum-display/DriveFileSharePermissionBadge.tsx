import { Badge, BadgeProps } from '@mantine/core';

import { useDriveFileSharePermissionValue } from '../../hooks/enum/useDriveFileSharePermissionValue';
import { DriveFileSharePermission } from '../../type';

type DriveFileSharePermissionBadgeProps = {
	e: DriveFileSharePermission;
} & Pick<BadgeProps, 'variant' | 'size'>;

export function DriveFileSharePermissionBadge({
	e,
	variant,
	size,
}: DriveFileSharePermissionBadgeProps): React.ReactNode {
	const value = useDriveFileSharePermissionValue();
	const color: Record<DriveFileSharePermission, BadgeProps['color']> = {
		[DriveFileSharePermission.VIEW]: 'blue',
		[DriveFileSharePermission.EDIT]: 'orange',
		[DriveFileSharePermission.EDIT_TRASH]: 'grape',
	};

	return (
		<Badge variant={variant} size={size} color={color[e]}>
			{value(e)}
		</Badge>
	);
}

