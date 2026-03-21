import { Badge, BadgeProps } from '@mantine/core';

import { EnumBagdeProps } from './EnumBadge';
import { useDriveFileStatusValue } from '../../hooks';
import { DriveFileStatus } from '../../types';


export function DriveFileStatusBadge({ e, variant, size }: EnumBagdeProps<DriveFileStatus>) {
	const value = useDriveFileStatusValue();
	const color: Record<DriveFileStatus, BadgeProps['color']> = {
		'active': 'green',
		'in-trash': 'red',
		'parent-in-trash': 'orange',
	};

	return (
		<Badge
			variant={variant}
			size={size}
			color={color[e]}
		>
			{value(e)}
		</Badge>
	);
}
