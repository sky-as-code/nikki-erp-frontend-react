import React from 'react';

import { DriveFileShareManager } from '@/features/fileShare';

import type { DriveFile } from '@/features/files/types';



export type DriveFileShareModalContentProps = {
	file: DriveFile;
};

export function DriveFileShareModalContent({
	file,
}: DriveFileShareModalContentProps): React.ReactNode {
	return <DriveFileShareManager file={file} />;
}

