import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Modal, rem, SegmentedControl, Select, Stack, Text, TextInput } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { IconFileUpload, IconUpload, IconX } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { DriveFileVisibility } from '../../types';

import { driveFileActions, selectCreateDriveFile } from '@/appState/file';


const createFileSchema = z.object({
	name: z.string().max(255, 'Name too long'),
	isFolder: z.boolean(),
	visibility: z.nativeEnum(DriveFileVisibility),
}).refine(
	(d) => d.isFolder ? d.name.trim().length >= 1 : true,
	{ message: 'Name is required', path: ['name'] },
);

type CreateFileFormData = z.infer<typeof createFileSchema>;

function FileSelectDropzone({
	selectedFile,
	onSelect,
}: { selectedFile: File | null; onSelect: (f: File | null) => void }): React.ReactNode {
	return (
		<Dropzone
			onDrop={(files) => onSelect(files[0] ?? null)}
			onReject={() => onSelect(null)}
			maxSize={50 * 1024 ** 2}
			accept={undefined}
			maxFiles={1}
		>
			<Group justify='center' gap='xl' style={{ minHeight: rem(100), pointerEvents: 'none' }}>
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
					<Text size='lg' inline>Kéo thả file hoặc click để chọn</Text>
					<Text size='sm' c='dimmed' inline mt={7}>
						{selectedFile ? selectedFile.name : 'Chọn 1 file, tối đa 50MB'}
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
};

export function CreateFileModal({ opened, onClose, parentId, onSuccess }: CreateFileModalProps): React.ReactNode {
	const dispatch = useMicroAppDispatch();
	const createState = useMicroAppSelector(selectCreateDriveFile);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const form = useForm<CreateFileFormData>({
		resolver: zodResolver(createFileSchema),
		defaultValues: { name: '', isFolder: true, visibility: DriveFileVisibility.OWNER },
		mode: 'onChange',
	});
	const { control, handleSubmit, reset, watch, formState: { errors } } = form;
	const isFolder = watch('isFolder');

	useEffect(() => {
		if (opened) { reset({ name: '', isFolder: true, visibility: DriveFileVisibility.OWNER }); setSelectedFile(null); }
	}, [opened, reset]);
	useEffect(() => { if (isFolder) setSelectedFile(null); }, [isFolder]);

	const onSubmit = handleSubmit(async (data) => {
		if (!data.isFolder && !selectedFile) return;
		const payload = {
			parentDriveFileRef: parentId,
			name: data.name.trim() || (selectedFile?.name ?? ''),
			isFolder: data.isFolder,
			visibility: data.visibility,
			...(data.isFolder ? {} : { file: selectedFile! }),
		};
		const result = await (dispatch as (action: unknown) => Promise<{ type: string }>)(
			driveFileActions.createDriveFile(payload),
		);
		if (result?.type?.endsWith('/fulfilled')) { onClose(); onSuccess?.(); }
	});

	return (
		<form onSubmit={onSubmit}>
			<Stack gap='md' w={'350px'}>
				<Controller name='name' control={control} render={({ field }) => (
					<TextInput {...field} label='Name'
						placeholder={isFolder ? 'Enter folder name' : 'Enter name (optional, uses file name)'}
						error={errors.name?.message} required={isFolder} />
				)} />
				<Controller name='visibility' control={control} render={({ field }) => (
					<Select
						label='Visibility'
						value={field.value}
						onChange={field.onChange}
						data={[
							{ value: DriveFileVisibility.PUBLIC, label: 'Public' },
							{ value: DriveFileVisibility.OWNER, label: 'Owner' },
							{ value: DriveFileVisibility.SHARED, label: 'Private' },
						]}
					/>
				)} />
				<Controller name='isFolder' control={control} render={({ field }) => (
					<SegmentedControl value={field.value ? 'folder' : 'file'}
						onChange={(v) => field.onChange(v === 'folder')}
						data={[{ label: 'Folder', value: 'folder' }, { label: 'File', value: 'file' }]} />
				)} />
				{!isFolder && <FileSelectDropzone selectedFile={selectedFile} onSelect={setSelectedFile} />}
				{!isFolder && !selectedFile && <Text size='sm' c='red'>Vui lòng chọn file</Text>}
				<Group justify='flex-end' mt='md'>
					<Button variant='subtle' onClick={onClose}>Cancel</Button>
					<Button type='submit' loading={createState.status === 'pending'}
						disabled={isFolder ? false : !selectedFile}>Create</Button>
				</Group>
			</Stack>
		</form>
	);
}
