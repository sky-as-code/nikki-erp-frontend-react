import { Badge, BadgeProps } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { EnumBagdeProps } from './EnumBadge';
import { DriveFileVisibility } from '../../types';


export function DriveFileVisibilityBadge({ e, variant, size }: EnumBagdeProps<DriveFileVisibility>) {
	const { t } = useTranslation();

	const color: Record<DriveFileVisibility, BadgeProps['color']> = {
		'owner': 'gray',
		'public': 'blue',
		'shared': 'yellow',
	};

	const value: Record<DriveFileVisibility, string> = {
		'owner': t('nikki.drive.enum.visibility.owner'),
		'public': t('nikki.drive.enum.visibility.public'),
		'shared': t('nikki.drive.enum.visibility.shared'),
	};

	return (
		<Badge
			variant={variant}
			color={color[e]}
			size={size}
		>
			{value[e]}
		</Badge>
	);
}
