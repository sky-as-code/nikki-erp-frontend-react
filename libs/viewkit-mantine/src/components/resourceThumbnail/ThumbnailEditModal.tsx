import { Center, Group, Image, Stack, Text } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { Button, Modal } from '@nikkierp/ui/components';
import { IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import React from 'react';

import classes from './ResourceThumbnail.module.css';
import { useObjectPreviewUrl } from '../resourceFileField/fileFieldHooks';

import '@mantine/dropzone/styles.css';

import type { TestIdAttributes } from '@nikkierp/common/utils';
import type { TranslateFn } from '@nikkierp/ui/i18n';


/** What the dialog hands back on confirm: a new file, or the removal of the current photo. */
export type ThumbnailEdit = { file: File, removed: false } | { file: null, removed: true };

export type ThumbnailEditModalProps = {
	opened: boolean,
	currentUrl: string | null,
	accept: string[],
	maxBytes: number,
	t: TranslateFn,
	attrs: (...segments: string[]) => TestIdAttributes,
	onConfirm: (edit: ThumbnailEdit) => void,
	onClose: () => void,
};

/**
 * Picks the next photo. Nothing is uploaded here: the choice is staged on the page and applied by
 * its Save, so Cancel on the page still discards it.
 */
export function ThumbnailEditModal(props: ThumbnailEditModalProps): React.ReactNode {
	const [draft, setDraft] = React.useState<File | null>(null);
	const [removed, setRemoved] = React.useState(false);
	const draftUrl = useObjectPreviewUrl(draft);
	const previewUrl = draftUrl ?? (removed ? null : props.currentUrl);

	React.useEffect(() => {
		setDraft(null);
		setRemoved(false);
	}, [props.opened]);

	const confirm = () => {
		if (draft) {
			props.onConfirm({ file: draft, removed: false });
		}
		else if (removed) {
			props.onConfirm({ file: null, removed: true });
		}
		props.onClose();
	};

	return (
		<Modal opened={props.opened} onClose={props.onClose} title={props.t('thumbnail.change')} centered>
			<Stack gap='sm'>
				<PhotoDropzone {...props} draft={draft} onPick={file => { setDraft(file); setRemoved(false); }} />
				{previewUrl ? (
					<Group justify='space-between' align='flex-end'>
						<Image src={previewUrl} alt={props.t('thumbnail.alt')} mah={160} maw={240} fit='contain' radius='md' />
						<Button
							variant='subtle'
							size='compact-sm'
							onClick={() => { setDraft(null); setRemoved(true); }}
							{...props.attrs('remove')}
						>
							{props.t('thumbnail.remove')}
						</Button>
					</Group>
				) : null}
				<Group justify='flex-end' gap='xs'>
					<Button variant='default' onClick={props.onClose} {...props.attrs('cancel')}>
						{props.t('action.cancel')}
					</Button>
					<Button onClick={confirm} disabled={!draft && !removed} {...props.attrs('confirm')}>
						{props.t('action.confirm')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}

function PhotoDropzone(props: ThumbnailEditModalProps & {
	draft: File | null,
	onPick: (file: File) => void,
}): React.ReactNode {
	const sizeMb = Math.round(props.maxBytes / (1024 * 1024));
	return (
		<Dropzone
			onDrop={files => { if (files[0]) props.onPick(files[0]); }}
			accept={props.accept}
			maxSize={props.maxBytes}
			multiple={false}
			{...props.attrs('dropzone')}
		>
			<Center mih={120} style={{ pointerEvents: 'none' }}>
				<Stack gap={4} align='center'>
					<Dropzone.Accept><IconUpload size={28} /></Dropzone.Accept>
					<Dropzone.Reject><IconX size={28} /></Dropzone.Reject>
					<Dropzone.Idle><IconPhoto size={28} /></Dropzone.Idle>
					<Text size='sm'>{props.draft ? props.draft.name : props.t('thumbnail.dropHint')}</Text>
					<Text size='xs' c='dimmed'>{props.t('thumbnail.limits', { size: sizeMb })}</Text>
				</Stack>
			</Center>
		</Dropzone>
	);
}

export function ThumbnailViewModal({ url, opened, t, onClose }: {
	url: string | null,
	opened: boolean,
	t: TranslateFn,
	onClose: () => void,
}): React.ReactNode {
	return (
		<Modal opened={opened && Boolean(url)} onClose={onClose} title={t('thumbnail.view')} centered size='lg'>
			<Center>
				{url ? <img src={url} alt={t('thumbnail.alt')} className={classes.preview} /> : null}
			</Center>
		</Modal>
	);
}
