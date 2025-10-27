import { MantineColor } from '@mantine/core';
import { IconCircleDottedLetterN } from '@tabler/icons-react';

export type NikkiModule = {
	color?: MantineColor
	icon?: typeof IconCircleDottedLetterN
	label: string
	slug: string
};





export * from './product';
export * from './organization';
export * from './user';
