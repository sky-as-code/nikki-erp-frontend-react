/**
 * Build stream URL cho drive file.
 * Path: /drive/files/:fileId/stream (cùng base với API, qua gateway).
 */
export function buildDriveStreamUrl(baseUrl: string, fileId: string, download: boolean = false): string {
	const base = baseUrl.replace(/\/$/, '');
	return `${base}/drive/files/${fileId}/stream${download ? '?download=true' : ''}`;
}
