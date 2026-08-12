import React from 'react';

import { DriveFileShareManager } from '../../../../fileShare';

import type { DriveFile } from '../../../types';





export type DriveFileShareModalContentProps = {
	file: DriveFile,
};

export function DriveFileShareModalContent({
	file,
}: DriveFileShareModalContentProps): React.ReactNode {
	return <DriveFileShareManager file={file} />;
}

