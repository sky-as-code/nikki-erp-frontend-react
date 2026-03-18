import { Badge, BadgeProps } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { EnumBagdeProps } from './EnumBadge';
import { DriveFileStatus } from '../../types';


export function DriveFileStatusBadge({ e, variant, size }: EnumBagdeProps<DriveFileStatus>) {
	const { t } = useTranslation();

	const color: Record<DriveFileStatus, BadgeProps['color']> = {
		'active': 'green',
		'in-trash': 'red',
		'parent-in-trash': 'orange',
	};

	const value: Record<DriveFileStatus, string> = {
		'active': t('nikki.drive.enum.status.active'),
		'in-trash': t('nikki.drive.enum.status.inTrash'),
		'parent-in-trash': t('nikki.drive.enum.status.parentInTrash'),
	};

	return (
		<Badge
			variant={variant}
			size={size}
			color={color[e]}
		>
			{value[e]}
		</Badge>
	);
}
