import type { ActionLock } from '../../permissions';


/**
 * What a click on the header photo does: nothing, enlarge it (`view`), open the upload dialog (`edit`), or explain
 * the missing update grant on its file field (`locked`).
 */
export type ThumbnailMode = 'none' | 'view' | 'edit' | 'locked';

export type ThumbnailModeInput = {
	/** The page is in update mode and the resource has an update command. */
	editable: boolean,
	/** The field-level update lock on the file field (`update:<schema>.<file field>`). */
	updateLock: ActionLock,
	hasImage: boolean,
};

/** View mode only previews; update mode edits, or locks when the caller may not update the file field. */
export function thumbnailMode(input: ThumbnailModeInput): ThumbnailMode {
	if (input.editable) {
		return input.updateLock.locked ? 'locked' : 'edit';
	}
	return input.hasImage ? 'view' : 'none';
}
