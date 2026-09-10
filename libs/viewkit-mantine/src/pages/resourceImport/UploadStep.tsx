import { Group, Stack, Text } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { Button } from '@nikkierp/ui/components';
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
	file: File | null,
	problem: ImportFileProblem | null,
	onSelect: (file: File) => Promise<void>,
};

/**
 * "Select a file to upload" — the file is only parsed on confirm, so a wrong pick costs nothing
 * and the refusal (extension, size, no header) is shown in place before anything is uploaded.
 */
export function UploadStep({ t, tid, file, problem, onSelect }: UploadStepProps): React.ReactNode {
	const [pending, setPending] = React.useState<File | null>(file);
	const [busy, setBusy] = React.useState(false);

	const confirm = async () => {
		if (!pending) {
			return;
		}
		setBusy(true);
		try {
			await onSelect(pending);
		}
		finally {
			setBusy(false);
		}
	};

	return (
		<Stack gap='sm' maw={640}>
			<Text fw={500}>{t('import.selectFile')}</Text>
			<Dropzone
				onDrop={files => setPending(files[0] ?? null)}
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
			<Group justify='flex-end'>
				<Button variant='filled' disabled={!pending} loading={busy} onClick={() => void confirm()} {...tid('confirm')}>
					{t('import.confirmNext')}
				</Button>
			</Group>
		</Stack>
	);
}

function describeProblem(t: TranslateFn, problem: ImportFileProblem): string {
	if (problem === 'fileTooLarge') {
		return t('import.fileTooLarge', { max: `${Math.round(IMPORT_MAX_BYTES / (1024 * 1024))} MB` });
	}
	return t(`import.${problem}`);
}
