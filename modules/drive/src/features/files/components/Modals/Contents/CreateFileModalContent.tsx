import { Button, Collapse, Group, rem, Stack, Text } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import { AutoField, FormFieldProvider, FormStyleProvider } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { IconFileUpload, IconUpload, IconX } from '@tabler/icons-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { driveFileActions, selectCreateDriveFile } from '@/appState/file';

import driveFileSchemaJson from '../../../file-schema.json';
import { DriveFileVisibility } from '../../../types';

import type { ModelSchema } from '@nikkierp/ui/model';


const baseSchema = driveFileSchemaJson as ModelSchema;

/** Schema cho form Create: name, isFolder (hiện), visibility. */
const createFileFormSchema: ModelSchema = {
	...baseSchema,
	fields: {
		name: baseSchema.fields.name,
		isFolder: { ...baseSchema.fields.isFolder, hidden: false },
		visibility: baseSchema.fields.visibility,
	},
};

function FileSelectDropzone({
	selectedFile,
	onSelect,
	t,
	autoOpen,
}: {
	selectedFile: File | null;
	onSelect: (f: File | null) => void;
	t: (key: string) => string;
	autoOpen?: boolean;
}): React.ReactNode {
	const openRef = useRef<() => void>(null);
	const hasOpenedRef = useRef(false);

	useEffect(() => {
		if (autoOpen && !hasOpenedRef.current && openRef.current) {
			hasOpenedRef.current = true;
			openRef.current();
		}
	}, [autoOpen]);

	return (
		<Dropzone
			openRef={openRef}
			onDrop={(files) => onSelect(files[0] ?? null)}
			onReject={() => onSelect(null)}
			maxSize={50 * 1024 ** 2}
			accept={undefined}
			maxFiles={1}
		>
			<Group justify='center' gap='xl' mih={rem(100)} style={{ pointerEvents: 'none' }}>
				<Dropzone.Accept>
					<IconUpload size={40} stroke={1.5} />
				</Dropzone.Accept>
				<Dropzone.Reject>
					<IconX size={40} stroke={1.5} color='var(--mantine-color-red-6)' />
				</Dropzone.Reject>
				<Dropzone.Idle>
					<IconFileUpload size={40} stroke={1.5} />
				</Dropzone.Idle>
				<div>
					<Text size='lg' inline>{t('nikki.drive.createFile.dropzoneText')}</Text>
					<Text size='sm' c='dimmed' inline mt={7}>
						{selectedFile ? selectedFile.name : t('nikki.drive.createFile.dropzoneHint')}
					</Text>
				</div>
			</Group>
		</Dropzone>
	);
}

type CreateFileModalProps = {
	opened: boolean;
	onClose: () => void;
	parentId: string;
	onSuccess?: () => void;
	defaultIsFolder?: boolean;
};

export function CreateFileModalContent({
	opened, onClose, parentId, onSuccess, defaultIsFolder = false,
}: CreateFileModalProps): React.ReactNode {
	const { t } = useTranslation();
	const dispatch = useMicroAppDispatch();
	const createState = useMicroAppSelector(selectCreateDriveFile);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const defaultModelValue = useMemo(
		() => (opened ? {
			name: '',
			isFolder: defaultIsFolder,
			visibility: DriveFileVisibility.OWNER,
		} : undefined),
		[opened, defaultIsFolder],
	);

	const onSubmit = async (data: Record<string, unknown>) => {
		const isFolder = Boolean(data.isFolder);
		if (!isFolder && !selectedFile) return;

		const payload = {
			parentDriveFileRef: parentId,
			name: (data.name as string).trim() || (selectedFile?.name ?? ''),
			isFolder,
			visibility: data.visibility as DriveFileVisibility,
			...(isFolder ? {} : { file: selectedFile! }),
		};

		const result = await (dispatch as (action: unknown) => Promise<{ type: string }>)(
			driveFileActions.createDriveFile(payload),
		);

		if (result?.type?.endsWith('/fulfilled')) {
			notifications.show({
				title: t('nikki.drive.toast.createSuccess'),
				message: (data.name as string).trim() || selectedFile?.name,
				color: 'green',
			});
			onClose();
			onSuccess?.();
		}
		else {
			notifications.show({
				title: t('nikki.drive.toast.createError'),
				message: ((data.name as string).trim() || selectedFile?.name) ?? '',
				color: 'red',
			});
		}
	};

	return (
		<FormStyleProvider layout='onecol'>
			<FormFieldProvider
				formVariant='create'
				modelSchema={createFileFormSchema}
				modelValue={defaultModelValue}
			>
				{({ handleSubmit, form }) => (
					<CreateFileFormInner
						form={form}
						handleSubmit={handleSubmit}
						onSubmit={onSubmit}
						selectedFile={selectedFile}
						setSelectedFile={setSelectedFile}
						opened={opened}
						onClose={onClose}
						createState={createState}
						t={t}
						defaultIsFolder={defaultIsFolder}
					/>
				)}
			</FormFieldProvider>
		</FormStyleProvider>
	);
}

type CreateFileFormInnerProps = {
	form: ReturnType<typeof import('react-hook-form').useForm>;
	handleSubmit: (onValid: (data: Record<string, unknown>) =>
		void | Promise<void>) => (e?: React.BaseSyntheticEvent) => Promise<void>;
	onSubmit: (data: Record<string, unknown>) => Promise<void>;
	selectedFile: File | null;
	setSelectedFile: (f: File | null) => void;
	opened: boolean;
	onClose: () => void;
	createState: { status: string };
	t: (key: string) => string;
	defaultIsFolder: boolean;
};

function CreateFileFormInner({
	form,
	handleSubmit: formHandleSubmit,
	onSubmit,
	selectedFile,
	setSelectedFile,
	opened,
	onClose,
	createState,
	t,
	defaultIsFolder,
}: CreateFileFormInnerProps): React.ReactNode {
	const isFolder = form.watch('isFolder');

	useEffect(() => {
		if (opened) {
			form.reset({ name: '', isFolder: defaultIsFolder, visibility: DriveFileVisibility.OWNER });
			setSelectedFile(null);
		}
	}, [opened, defaultIsFolder, form, setSelectedFile]);

	useEffect(() => {
		if (isFolder) setSelectedFile(null);
	}, [isFolder, setSelectedFile]);

	useEffect(() => {
		if (selectedFile) {
			form.setValue('name', selectedFile.name);
		}
	}, [selectedFile, form]);

	const canSubmit = isFolder || Boolean(selectedFile);

	return (
		<form onSubmit={formHandleSubmit(onSubmit)} noValidate autoComplete='off'>
			<Stack gap='md' w='350px'>
				<AutoField name='name' />
				<AutoField name='visibility' />
				<AutoField name='isFolder' />
				<Collapse in={!isFolder} transitionDuration={200} transitionTimingFunction='ease'>
					<Stack gap='xs'>
						<FileSelectDropzone
							selectedFile={selectedFile}
							onSelect={setSelectedFile}
							t={t}
							autoOpen={opened && !defaultIsFolder && !selectedFile}
						/>
						{!selectedFile && (
							<Text size='sm' c='red'>{t('nikki.drive.createFile.pleaseSelectFile')}</Text>
						)}
					</Stack>
				</Collapse>
				<Group justify='flex-end' mt='md'>
					<Button variant='subtle' onClick={onClose}>{t('nikki.drive.modals.cancel')}</Button>
					<Button
						type='submit'
						loading={createState.status === 'pending'}
						disabled={!canSubmit}
					>
						{t('nikki.drive.createFile.create')}
					</Button>
				</Group>
			</Stack>
		</form>
	);
}
