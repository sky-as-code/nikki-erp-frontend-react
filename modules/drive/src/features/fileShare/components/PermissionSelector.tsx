import { Select } from '@mantine/core';
import React from 'react';

import type { DriveFileSharePermission as DriveFileSharePermissionType } from '@/features/fileShare/type';

import { DriveFileSharePermissionDisplay } from '@/features/fileShare';



export type PermissionSelectorProps = {
	value: DriveFileSharePermissionType;
	options: Array<{ value: DriveFileSharePermissionType; label: string }>;
	onChange: (nextPermission: DriveFileSharePermissionType) => void;
	w?: number | string;
};

export function PermissionSelector({
	value,
	options,
	onChange,
	w,
}: PermissionSelectorProps): React.ReactNode {
	return (
		<Select
			data={options}
			value={value}
			w={w}
			onChange={(nextValue) => {
				if (!nextValue) return;
				onChange(nextValue as DriveFileSharePermissionType);
			}}
			renderOption={({ option }) => (
				<DriveFileSharePermissionDisplay
					e={option.value as DriveFileSharePermissionType}
					textProps={{ size: 'sm' }}
				/>
			)}
		/>
	);
}
