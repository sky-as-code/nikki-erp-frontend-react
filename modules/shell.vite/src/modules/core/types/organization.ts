import { IconCircleDottedLetterN } from '@tabler/icons-react';

export type Organization = {
	id: string;
	logo?: string | typeof IconCircleDottedLetterN; // image path or an icon
	name: string;
	slug: string;
};