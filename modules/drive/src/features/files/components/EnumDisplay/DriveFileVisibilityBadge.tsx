import { Badge, BadgeProps } from '@mantine/core';

import { EnumBagdeProps } from './EnumBadge';
import { useDriveFileVisibilityValue } from '../../hooks';
import { DriveFileVisibility } from '../../types';


export function DriveFileVisibilityBadge({ e, variant, size }: EnumBagdeProps<DriveFileVisibility>) {
	const value = useDriveFileVisibilityValue();

	const color: Record<DriveFileVisibility, BadgeProps['color']> = {
		'owner': 'gray',
		'public': 'blue',
		'shared': 'yellow',
	};

	return (
		<Badge
			variant={variant}
			color={color[e]}
			size={size}
		>
			{value(e)}
		</Badge>
	);
}
