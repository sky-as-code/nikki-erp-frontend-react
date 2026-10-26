import { RequestMaker } from './request';


export type StorageFileUrlOptions = {
	/** Answers `Content-Disposition: attachment` instead of displaying inline. */
	download?: boolean,
};

/**
 * The URL that displays or downloads a stored file by its `*_file_path`, through the BFF, which
 * adds the session; Storage checks the reader's permission on every request.
 */
export function storageFileUrl(path: string, options: StorageFileUrlOptions = {}): string {
	const baseUrl = RequestMaker.defaultBaseUrl().replace(/\/+$/, '');
	const query = new URLSearchParams({ path });
	if (options.download) {
		query.set('download', '1');
	}
	return `${baseUrl}/v1/itstorage/files/download?${query.toString()}`;
}

/** {@link storageFileUrl} for a path read off a record, null when the record holds none. */
export function storageFileUrlOf(path: unknown, options?: StorageFileUrlOptions): string | null {
	return typeof path === 'string' && path !== '' ? storageFileUrl(path, options) : null;
}
