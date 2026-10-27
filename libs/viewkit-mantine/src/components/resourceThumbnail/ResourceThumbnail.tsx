import { Center, Image, UnstyledButton } from '@mantine/core';
import { toDisplayedEntitlements } from '@nikkierp/common/entitlements';
import { storageFileUrlOf } from '@nikkierp/common/request';
import { useShowLockedFeature } from '@nikkierp/ui/components';
import { useTranslate } from '@nikkierp/ui/i18n';
import { IconLock, IconPencil, IconPhoto } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';

import classes from './ResourceThumbnail.module.css';
import { ThumbnailEditModal, ThumbnailViewModal } from './ThumbnailEditModal';
import { thumbnailMode } from './thumbnailMode';
import {
	useResourceDetailContext, useResourceDetailSchemaName, useResourceDetailTestAttrs,
} from '../../pages/resourceDetail/ResourceDetailProvider';
import { useResourceUpdateContext } from '../../pages/resourceDetail/resourceUpdateContext';
import { StandardActionCode, useFieldLock } from '../../permissions';
import { toStagedFile, useFileFieldContribution, useObjectPreviewUrl } from '../resourceFileField/fileFieldHooks';
import { useResourceFormView } from '../resourceFormViewContext';

import type { ResourceThumbnailSpec } from './props';
import type { ThumbnailEdit } from './ThumbnailEditModal';
import type { ThumbnailMode } from './thumbnailMode';


function readString(record: Record<string, unknown> | undefined, key: string | undefined): string | null {
	const value = key ? record?.[key] : undefined;
	return typeof value === 'string' && value !== '' ? value : null;
}

/**
 * The photo of the record a detail page shows, left of its titles. In view mode a click enlarges
 * it; in update mode a hover overlay opens the upload dialog, and the choice is sent with the page's
 * Save, in the record's own update request, like `ResourceFileField`'s. Without the update grant on
 * the file field the overlay shows a lock instead, whose click explains the refusal.
 */
export function ResourceThumbnail({ spec }: { spec: ResourceThumbnailSpec }): React.ReactNode {
	const { translationNs } = useResourceDetailContext();
	const t = useTranslate(translationNs);
	const testAttrs = useResourceDetailTestAttrs();
	const context = useResourceUpdateContext();
	const view = useResourceFormView();
	const staged = useStagedThumbnail(spec, context.resource, view?.updateMode);

	useFileFieldContribution(spec.fileIdField, context.registerFileField, staged.pending);

	const editable = Boolean(view?.updateMode && context.commands.update);
	const [dialog, setDialog] = React.useState<'view' | 'edit' | null>(null);
	const click = useThumbnailClick(spec, editable, Boolean(staged.shownUrl), setDialog);
	const attrs = (...segments: string[]) => testAttrs('thumbnail', ...segments);

	return (
		<>
			<UnstyledButton
				className={clsx(classes.frame, { [classes.clickable]: click.mode !== 'none' })}
				disabled={click.mode === 'none'}
				onClick={click.onClick}
				aria-label={click.label}
				data-locked={click.mode === 'locked' ? 'true' : undefined}
				{...attrs()}
			>
				{staged.shownUrl
					? <Image src={staged.shownUrl} alt={t('thumbnail.alt')} w={64} h={64} fit='cover' />
					: <Center className={classes.placeholder}><IconPhoto size={28} /></Center>}
				<ThumbnailOverlay mode={click.mode} />
			</UnstyledButton>
			<ThumbnailViewModal
				url={staged.shownUrl} opened={dialog === 'view'} t={t} onClose={() => setDialog(null)}
			/>
			<ThumbnailEditModal
				opened={dialog === 'edit'}
				currentUrl={staged.shownUrl}
				accept={spec.accept}
				maxBytes={spec.maxBytes}
				t={t}
				attrs={(...segments) => attrs('edit', ...segments)}
				onConfirm={staged.apply}
				onClose={() => setDialog(null)}
			/>
		</>
	);
}

/** The photo's click: preview, upload dialog, or the refusal modal when the file field may not be updated. */
function useThumbnailClick(
	spec: ResourceThumbnailSpec, editable: boolean, hasImage: boolean,
	setDialog: (dialog: 'view' | 'edit') => void,
): { mode: ThumbnailMode, label: string, onClick: () => void } {
	const t = useTranslate(useResourceDetailContext().translationNs);
	const schemaName = useResourceDetailSchemaName();
	const updateLock = useFieldLock(editable ? schemaName : null, spec.fileIdField, StandardActionCode.Update);
	const showLocked = useShowLockedFeature();
	const mode = thumbnailMode({ editable, updateLock, hasImage });
	const lockedMessage = t('permission.field_update_locked', {
		expression: toDisplayedEntitlements(updateLock.missing).join(', '),
	});
	const onClick = (): void => {
		if (mode === 'locked') {
			showLocked(updateLock.missing, lockedMessage);
			return;
		}
		setDialog(mode === 'edit' ? 'edit' : 'view');
	};
	const label = mode === 'locked' ? lockedMessage : t(mode === 'edit' ? 'thumbnail.change' : 'thumbnail.view');
	return { mode, label, onClick };
}

/** Rendered in update mode only and shown on hover (CSS): a pencil, or a lock when the file field is locked. */
function ThumbnailOverlay({ mode }: { mode: ThumbnailMode }): React.ReactNode {
	if (mode !== 'edit' && mode !== 'locked') {
		return null;
	}
	return (
		<div className={classes.overlay} aria-hidden>
			{mode === 'locked' ? <IconLock size={22} /> : <IconPencil size={22} />}
		</div>
	);
}

/**
 * The thumbnail's staged edit. A new record or a toggle of update mode discards it, which is what
 * makes the page's Cancel discard a photo picked but not saved.
 */
function useStagedThumbnail(
	spec: ResourceThumbnailSpec, resource: Record<string, unknown> | undefined, updateMode: boolean | undefined,
) {
	const [file, setFile] = React.useState<File | null>(null);
	const [removed, setRemoved] = React.useState(false);
	const localUrl = useObjectPreviewUrl(file);

	React.useEffect(() => {
		setFile(null);
		setRemoved(false);
	}, [resource, updateMode]);

	const fileUrl = storageFileUrlOf(resource?.[spec.fileIdField]);
	const fallbackUrl = (spec.fallbackFileIdField ? storageFileUrlOf(resource?.[spec.fallbackFileIdField]) : null)
		?? readString(resource, spec.fallbackUrlField);
	const apply = React.useCallback((edit: ThumbnailEdit) => {
		setFile(edit.file);
		setRemoved(edit.removed);
	}, []);

	return {
		shownUrl: localUrl ?? (removed ? fallbackUrl : fileUrl ?? fallbackUrl),
		apply,
		pending: toStagedFile(file, removed, Boolean(fileUrl)),
	};
}
