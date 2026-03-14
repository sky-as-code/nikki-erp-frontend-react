import { useShellEnvVars } from '@nikkierp/shell/config';
import { useCallback } from 'react';

import { buildDriveStreamUrl } from '@/features/files/utils/driveUrlUtils';


export function useDriveStreamUrl(): (fileId: string, download: boolean) => string {
	const { BASE_API_URL } = useShellEnvVars();
	return useCallback(
		(fileId: string, download: boolean = false) => buildDriveStreamUrl(BASE_API_URL, fileId, download),
		[BASE_API_URL],
	);
}
