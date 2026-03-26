import React from 'react';

import type { DriveFile } from '@/features/files/types';

import { DriveFileShareManager } from '@/features/fileShare';




export type DriveFileShareModalContentProps = {
	file: DriveFile;
};

export function DriveFileShareModalContent({
	file,
}: DriveFileShareModalContentProps): React.ReactNode {
	return <DriveFileShareManager file={file} />;
}

