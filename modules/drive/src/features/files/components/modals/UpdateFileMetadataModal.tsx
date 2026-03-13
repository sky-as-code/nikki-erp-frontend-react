import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Select, Stack, TextInput } from '@mantine/core';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { driveFileActions, selectUpdateMetadataDriveFile } from '@/appState/file';

import { useRefreshCurrentFolder } from '../../hooks';
import { DriveFile, DriveFileVisibility, UpdateDriveFileMetadataRequest } from '../../types';



const updateFileSchema = z.object({
	name: z.string().max(255, 'Name too long').min(1, 'Name is required'),
	visibility: z.nativeEnum(DriveFileVisibility),
});

type UpdateFileFormData = z.infer<typeof updateFileSchema>;

type UpdateFileMetadataModalProps = {
	opened: boolean;
	onClose: () => void;
	file?: DriveFile;
};

// eslint-disable-next-line max-lines-per-function
export function UpdateFileMetadataModal(
	{ opened, onClose, file }: UpdateFileMetadataModalProps,
): React.ReactNode {
	const dispatch = useMicroAppDispatch();
	const updateState = useMicroAppSelector(selectUpdateMetadataDriveFile);
	const { refresh } = useRefreshCurrentFolder();

	const form = useForm<UpdateFileFormData>({
		resolver: zodResolver(updateFileSchema),
		defaultValues: {
			name: file?.name ?? '',
			visibility: file?.visibility ?? DriveFileVisibility.OWNER,
		},
		mode: 'onChange',
	});

	const { control, handleSubmit, reset, formState: { errors } } = form;

	useEffect(() => {
		if (opened && file) {
			reset({
				name: file.name,
				visibility: file.visibility,
			});
		}
	}, [opened, reset, file]);

	const onSubmit = handleSubmit(async (data) => {
		if (!file) return;

		const req: UpdateDriveFileMetadataRequest = {
			etag: file.etag,
			name: data.name.trim(),
			visibility: data.visibility,
		};

		const result = await (dispatch as (action: unknown) => Promise<{ type: string }>)(
			driveFileActions.updateMetadataDriveFile({
				fileId: file.id,
				req,
			}),
		);

		if (result?.type?.endsWith('/fulfilled')) {
			refresh({
				parentId: file.parentDriveFileRef ?? undefined,
				includeTree: true,
				treePageSize: 50,
			});
			onClose();
		}
	});

	const isPending = updateState.status === 'pending';

	return (
		<form onSubmit={onSubmit}>
			<Stack gap='md' w={'350px'}>
				<Controller
					name='name'
					control={control}
					render={({ field }) => (
						<TextInput
							{...field}
							label='Name'
							placeholder='Enter file or folder name'
							error={errors.name?.message}
							required
						/>
					)}
				/>
				<Controller
					name='visibility'
					control={control}
					render={({ field }) => (
						<Select
							label='Visibility'
							value={field.value}
							onChange={field.onChange}
							data={[
								{ value: DriveFileVisibility.PUBLIC, label: 'Public' },
								{ value: DriveFileVisibility.OWNER, label: 'Owner' },
								{ value: DriveFileVisibility.SHARED, label: 'Shared' },
							]}
						/>
					)}
				/>
				<Group justify='flex-end' mt='md'>
					<Button variant='subtle' onClick={onClose}>
						Cancel
					</Button>
					<Button type='submit' loading={isPending}>
						Update
					</Button>
				</Group>
			</Stack>
		</form>
	);
}

