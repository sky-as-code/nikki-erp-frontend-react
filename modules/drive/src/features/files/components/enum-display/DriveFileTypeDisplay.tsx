import { Group, Text } from '@mantine/core';

import { useDriveFileTypeValue } from '../../hooks';
import { DriveFileType } from '../../types';
import { DriveFileIcon } from '../file-list/DriveFileIcon';


export function DriveFileTypeDisplay({ e }: { e: DriveFileType }): React.ReactNode {
	const value = useDriveFileTypeValue();
	return (
		<Group gap={6} wrap='nowrap'>
			<DriveFileIcon type={e} size={16} />
			<Text size='sm'>{value(e)}</Text>
		</Group>
	);
}