import { Group, Stack, Text } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconFileSpreadsheet, IconUpload, IconX } from '@tabler/icons-react';
import React from 'react';

import { IMPORT_MAX_BYTES } from './parseHeaders';

import type { ImportFileProblem } from './useImportWizard';
import type { TranslateFn } from '@nikkierp/ui/i18n';

import '@mantine/dropzone/styles.css';


/** By extension as well as MIME: a csv arrives as `application/vnd.ms-excel` from Windows. */
const ACCEPT = {
	'text/csv': ['.csv'],
	'application/vnd.ms-excel': ['.csv', '.xls'],
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
};

type UploadStepProps = {
	t: TranslateFn,
	tid: (part: string) => Record<string, string>,
	pending: File | null,
	problem: ImportFileProblem | null,
	onPick: (file: File | null) => void,
};

/**
 * "Select a file to upload" — the file is only parsed on confirm, so a wrong pick costs nothing
 * and the refusal (extension, size, no header) is shown in place before anything is uploaded.
 *
 * Confirm itself lives in the page header's action row, so the pick is reported upward rather
 * than held here.
 */
export function UploadStep({ t, tid, pending, problem, onPick }: UploadStepProps): React.ReactNode {
	return (
		<Stack gap='sm' maw={640}>
			<Text fw={500}>{t('import.selectFile')}</Text>
			<Dropzone
				onDrop={files => onPick(files[0] ?? null)}
				accept={ACCEPT}
				maxSize={IMPORT_MAX_BYTES}
				multiple={false}
				{...tid('dropzone')}
			>
				<Group justify='center' gap='sm' mih={120} style={{ pointerEvents: 'none' }}>
					<Dropzone.Accept><IconUpload size={32} /></Dropzone.Accept>
					<Dropzone.Reject><IconX size={32} /></Dropzone.Reject>
					<Dropzone.Idle><IconFileSpreadsheet size={32} /></Dropzone.Idle>
					<Stack gap={2} align='center'>
						<Text size='sm'>{pending ? pending.name : t('import.dropHint')}</Text>
						<Text size='xs' c='dimmed'>{t('import.acceptedFormats')}</Text>
					</Stack>
				</Group>
			</Dropzone>
			{problem ? <Text size='sm' c='red' {...tid('fileProblem')}>{describeProblem(t, problem)}</Text> : null}
		</Stack>
	);
}

function describeProblem(t: TranslateFn, problem: ImportFileProblem): string {
	if (problem === 'fileTooLarge') {
		return t('import.fileTooLarge', { max: `${Math.round(IMPORT_MAX_BYTES / (1024 * 1024))} MB` });
	}
	return t(`import.${problem}`);
}
