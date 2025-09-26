

import { Button, ButtonProps } from '@mantine/core';
import React from 'react';

import {
	SearchableSelect,
	SearchableSelectProps,
} from '@/common/components/SearchableSelect';

export type FlatSearchableSelectProps = Omit<
	SearchableSelectProps,
	'triggerComponent'
> & {
	targetColor?: ButtonProps['color'];
	targetClass?: ButtonProps['className'];
	targetFz?: ButtonProps['fz'];
	targetFw?: ButtonProps['fw'];
	targetP?: ButtonProps['p'];
	targetPb?: ButtonProps['pb'];
	targetPt?: ButtonProps['pt'];
	targetSize?: ButtonProps['size'];
	targetVariant?: ButtonProps['variant'];
};

export const FlatSearchableSelect: React.FC<FlatSearchableSelectProps> = (
	props
) => {
	return (
		<SearchableSelect {...props} triggerComponent={createFlatButton(props)} />
	);
};

function createFlatButton(preProps: FlatSearchableSelectProps) {
	const FlatButton: typeof Button = (({ children, ...props }: ButtonProps) => {
		return (
			<Button
				style={{
					color: 'var(--mantine-color-text)',
				}}
				{...props}
				// color={preProps.targetColor}
				className={preProps.targetClass}
				fz={preProps.targetFz}
				fw={preProps.targetFw}
				p={preProps.targetP ?? 0}
				pb={preProps.targetPb ?? 0}
				pt={preProps.targetPt ?? 0}
				size={preProps.targetSize ?? 'compact-lg'}
				variant={preProps.targetVariant ?? 'subtle'}
				// fz='xl'
				// fw='bolder'
				// p={0}
				// color='#000000'
			>
				{children}
			</Button>
		);
	}) as any;
	return FlatButton;
}
