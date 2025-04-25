'use client';

import { Button, ButtonProps } from '@mantine/core';
import React from 'react';

import { SearchableSelect, SearchableSelectProps } from '@/components/SearchableSelect';


export type FlatSearchableSelectProps = Omit<SearchableSelectProps, 'triggerComponent'>;

export const FlatSearchableSelect: React.FC<FlatSearchableSelectProps> = (props) => {
	return (
		<SearchableSelect
			{...props}
			triggerComponent={FlatButton}
		/>
	);
};

const FlatButton: typeof Button = (({children, ...props}: ButtonProps) => {
	return (
		<Button
			{...props}
			variant='subtle'
			size='compact-lg'
			fz='xl'
			fw='bolder'
			p={0}
			color='#000000'
		>
			{children}
		</Button>
	);
}) as any;