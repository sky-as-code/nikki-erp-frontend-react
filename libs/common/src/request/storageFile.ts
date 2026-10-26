import { RequestMaker } from './request';


export type StorageFileUrlOptions = {
	/** Answers `Content-Disposition: attachment` instead of displaying inline. */
	download?: boolean,
};

/**
 * The URL that displays or downloads a stored file by its id (a record's `*_file_id`), through the
 * BFF, which adds the session; Storage checks the reader's permission on every request.
 */
export function storageFileUrl(fileId: string, options: StorageFileUrlOptions = {}): string {
	const baseUrl = RequestMaker.defaultBaseUrl().replace(/\/+$/, '');
	const query = options.download ? '?download=1' : '';
	return `${baseUrl}/v1/itstorage/files/${encodeURIComponent(fileId)}/download${query}`;
}

/** {@link storageFileUrl} for a file id read off a record, null when the record holds none. */
export function storageFileUrlOf(fileId: unknown, options?: StorageFileUrlOptions): string | null {
	return typeof fileId === 'string' && fileId !== '' ? storageFileUrl(fileId, options) : null;
}
