'use client';

import { Flex, Text } from '@mantine/core';
import { IconCircleDottedLetterN } from '@tabler/icons-react';
import cls from 'clsx';
import Link from 'next/link';

import classes from './Logo.module.css';

interface Props {
	width?: string;
	height?: string;
}

export const Logo: React.FC<Props> = () => {
	return (
		<Flex direction='row' align='center' gap={4}>
			<Link
				href='/'
				style={{ textDecoration: 'none' }}
				className={cls(classes.heading, 'flex flex-row')}
			>
				<IconCircleDottedLetterN size={34} />
				<Text fw='bolder' size='xl'>
					Nikki
					<Text component='span' fw='normal' className={classes.subheading}>
						ERP
					</Text>
				</Text>
			</Link>
		</Flex>
	);
};
