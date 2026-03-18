export const DRIVE_TABS = {
	MY_FILES: 'my-files',
	TRASH: 'trash',
	SHARED_WITH_ME: 'shared-with-me',
	STARRED: 'starred',
} as const;

export type DriveTabPath =
	(typeof DRIVE_TABS)[keyof typeof DRIVE_TABS];

