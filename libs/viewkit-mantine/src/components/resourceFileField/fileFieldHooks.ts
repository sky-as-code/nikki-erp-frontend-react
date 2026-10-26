import React from 'react';

import type { RegisterFileField, StagedFile } from '../../pages/resourceDetail/afterSave';


/** The staged edit of a file field: a chosen file wins; a removal counts only when a file is stored. */
export function toStagedFile(file: File | null, removed: boolean, hadFile: boolean): StagedFile | undefined {
	if (file) {
		return { file };
	}
	return removed && hadFile ? { removed: true } : undefined;
}

/**
 * Registers a file field with the detail form, which sends its staged edit in the record's own create
 * or update request (multipart when a file is chosen, `null` when removed). Shared by every editor of
 * a file field.
 */
export function useFileFieldContribution(
	fileIdField: string, register: RegisterFileField | undefined, staged: StagedFile | undefined,
): void {
	const stagedRef = React.useRef(staged);
	stagedRef.current = staged;

	React.useEffect(
		() => register?.({ field: fileIdField, staged: () => stagedRef.current }),
		[register, fileIdField],
	);
}

/** An object URL for a local file, revoked when the file changes or the caller unmounts. */
export function useObjectPreviewUrl(file: File | null): string | null {
	const [url, setUrl] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (!file) {
			setUrl(null);
			return undefined;
		}
		const objectUrl = URL.createObjectURL(file);
		setUrl(objectUrl);
		return () => URL.revokeObjectURL(objectUrl);
	}, [file]);

	return url;
}
