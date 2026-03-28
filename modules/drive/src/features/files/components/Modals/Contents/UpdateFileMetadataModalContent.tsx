import { Button, Group, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { AutoField, FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';


import driveFileSchemaJson from '../../../file-schema.json';
import { useRefreshCurrentFolder } from '../../../hooks';
import { DriveFile, UpdateDriveFileMetadataRequest } from '../../../types';

import type { ModelSchema } from '@nikkierp/ui/model';

import { driveFileActions, selectUpdateMetadataDriveFile } from '@/appState/file';


const driveFileSchema = driveFileSchemaJson as ModelSchema;

type UpdateFileMetadataModalProps = {
	opened: boolean;
	onClose: () => void;
	file?: DriveFile;
};

export function UpdateFileMetadataModal(
	{ opened: _opened, onClose, file }: UpdateFileMetadataModalProps,
): React.ReactNode {
	const { t } = useTranslation();
	const dispatch = useMicroAppDispatch();
	const updateState = useMicroAppSelector(selectUpdateMetadataDriveFile);
	const { refresh } = useRefreshCurrentFolder();

	const modelValue = useMemo(
		() => (file ? { name: file.name, visibility: file.visibility } : undefined),
		[file?.id, file?.name, file?.visibility],
	);

	const onSubmit = async (data: Record<string, unknown>) => {
		if (!file) return;

		const req: UpdateDriveFileMetadataRequest = {
			etag: file.etag,
			name: (data.name as string).trim(),
			visibility: data.visibility as DriveFile['visibility'],
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
			notifications.show({
				title: t('nikki.drive.toast.updateSuccess'),
				message: (data.name as string).trim(),
				color: 'green',
			});
			onClose();
		}
		else {
			notifications.show({
				title: t('nikki.drive.toast.updateError'),
				message: file.name,
				color: 'red',
			});
		}
	};

	const isPending = updateState.status === 'pending';

	return (
		<FormStyleProvider layout='onecol'>
			<FormFieldProvider
				formVariant='update'
				modelSchema={driveFileSchema}
				modelValue={modelValue}
			>
				{({ handleSubmit }) => (
					<form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete='off'>
						<Stack gap='md' w='350px'>
							<AutoField name='name' />
							<AutoField name='visibility' />
							<Group justify='flex-end' mt='md'>
								<Button variant='subtle' onClick={onClose}>
									{t('nikki.drive.modals.cancel')}
								</Button>
								<Button type='submit' loading={isPending}>
									{t('nikki.drive.updateFile.update')}
								</Button>
							</Group>
						</Stack>
					</form>
				)}
			</FormFieldProvider>
		</FormStyleProvider>
	);
}
