import { BadgeProps } from '@mantine/core';


export type EnumBagdeProps<T> = {
	e: T;
} & Pick<BadgeProps, 'variant' | 'size'>;
