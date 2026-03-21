import { ActionIcon, Group } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import React from 'react';

import { useDriveFileActions } from '../../../hooks';
import { DriveFile } from '../../../types';
import { FilePreview } from '../../Preview';

import { useDriveStreamUrl } from '@/hooks';


type PreviewFileModalContentProps = {
	file: DriveFile;
	onClose: () => void;
};

export function PreviewFileModalContent({
	file,
}: PreviewFileModalContentProps): React.ReactNode {
	const {download} = useDriveFileActions(file);

	const buildStreamUrl = useDriveStreamUrl();
	const streamUrl = buildStreamUrl(file.id, false);

	return (
		<>
			<FilePreview
				streamUrl={streamUrl}
				mime={file.mime}
				name={file.name}
			/>
			<Group justify='flex-end' mt='md' gap='xs'>
				<ActionIcon onClick={download}>
					<IconDownload/>
				</ActionIcon>
			</Group>
		</>
	);
}
