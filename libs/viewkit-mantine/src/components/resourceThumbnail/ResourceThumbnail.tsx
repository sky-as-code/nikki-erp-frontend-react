import { Center, Image, UnstyledButton } from '@mantine/core';
import { storageFileUrlOf } from '@nikkierp/common/request';
import { useTranslate } from '@nikkierp/ui/i18n';
import { IconPencil, IconPhoto } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';

import classes from './ResourceThumbnail.module.css';
import { ThumbnailEditModal, ThumbnailViewModal } from './ThumbnailEditModal';
import {
	useResourceDetailContext, useResourceDetailTestAttrs,
} from '../../pages/resourceDetail/ResourceDetailProvider';
import { useResourceUpdateContext } from '../../pages/resourceDetail/resourceUpdateContext';
import { useFileFieldAfterSave, useObjectPreviewUrl } from '../resourceFileField/fileFieldHooks';
import { useResourceFormView } from '../resourceFormViewContext';

import type { ResourceThumbnailSpec } from './props';
import type { ThumbnailEdit } from './ThumbnailEditModal';


function readString(record: Record<string, unknown> | undefined, key: string | undefined): string | null {
	const value = key ? record?.[key] : undefined;
	return typeof value === 'string' && value !== '' ? value : null;
}

/**
 * The photo of the record a detail page shows, left of its titles. In view mode a click enlarges
 * it; in update mode an overlay opens the upload dialog, and the choice is applied by the page's
 * Save through the same after-save step as `ResourceFileField`.
 */
export function ResourceThumbnail({ spec }: { spec: ResourceThumbnailSpec }): React.ReactNode {
	const { schemaPack, translationNs } = useResourceDetailContext();
	const t = useTranslate(translationNs);
	const testAttrs = useResourceDetailTestAttrs();
	const context = useResourceUpdateContext();
	const view = useResourceFormView();
	const staged = useStagedThumbnail(spec, context.resource, view?.updateMode);

	useFileFieldAfterSave(spec.field, context.registerAfterSave, schemaPack, staged.pending);

	const editable = Boolean(view?.updateMode && context.commands.update);
	const [dialog, setDialog] = React.useState<'view' | 'edit' | null>(null);
	const clickable = editable || Boolean(staged.shownUrl);
	const attrs = (...segments: string[]) => testAttrs('thumbnail', ...segments);

	return (
		<>
			<UnstyledButton
				className={clsx(classes.frame, { [classes.clickable]: clickable })}
				disabled={!clickable}
				onClick={() => setDialog(editable ? 'edit' : 'view')}
				aria-label={t(editable ? 'thumbnail.change' : 'thumbnail.view')}
				{...attrs()}
			>
				{staged.shownUrl
					? <Image src={staged.shownUrl} alt={t('thumbnail.alt')} w={64} h={64} fit='cover' />
					: <Center className={classes.placeholder}><IconPhoto size={28} /></Center>}
				{editable ? <div className={classes.overlay}><IconPencil size={22} /></div> : null}
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

	const fileUrl = storageFileUrlOf(resource?.[spec.pathField]);
	const fallbackUrl = readString(resource, spec.fallbackUrlField);
	const apply = React.useCallback((edit: ThumbnailEdit) => {
		setFile(edit.file);
		setRemoved(edit.removed);
	}, []);

	return {
		shownUrl: localUrl ?? (removed ? fallbackUrl : fileUrl ?? fallbackUrl),
		apply,
		pending: {
			file,
			removed,
			hadFile: Boolean(fileUrl),
			orgId: readString(resource, 'org_id') ?? undefined,
		},
	};
}
