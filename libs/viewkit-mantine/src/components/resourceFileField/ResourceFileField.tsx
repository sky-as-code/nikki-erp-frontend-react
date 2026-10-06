import { FileInput, Group, Image, Stack, Text } from '@mantine/core';
import { unwrapResult } from '@nikkierp/common/request';
import { Button } from '@nikkierp/ui/components';
import { useTranslate } from '@nikkierp/ui/i18n';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import React from 'react';

import { resourceFileFieldPropsSchema } from './props';
import { RESOURCE_FILE_FIELD } from '../../ids';
import { ResourceCreateContext } from '../../pages/resourceDetail/resourceCreateContext';
import {
	useResourceDetailContext, useResourceDetailTestAttrs,
} from '../../pages/resourceDetail/ResourceDetailProvider';
import { ResourceUpdateContext } from '../../pages/resourceDetail/resourceUpdateContext';
import { useResourceFormView } from '../resourceFormViewContext';

import type { ResourceFileFieldProps } from './props';
import type { RegisterAfterSave, SavedRecord } from '../../pages/resourceDetail/afterSave';
import type { SchemaPack } from '@nikkierp/common/dynamicModel';
import type { IComponentRenderer } from '@nikkierp/viewengine/core';


export const resourceFileFieldRenderer: IComponentRenderer<ResourceFileFieldProps> = {
	type: RESOURCE_FILE_FIELD,
	propsSchema: resourceFileFieldPropsSchema,
	render(props) {
		return (
			<ComponentAnchor id={RESOURCE_FILE_FIELD}>
				<ResourceFileField props={props} />
			</ComponentAnchor>
		);
	},
};

type PendingFile = {
	file: File | null,
	removed: boolean,
	hadFile: boolean,
	orgId?: string,
};

function readString(record: Record<string, unknown> | undefined, key: string): string | null {
	const value = record?.[key];
	return typeof value === 'string' && value !== '' ? value : null;
}

function ResourceFileField({ props }: { props: ResourceFileFieldProps }): React.ReactNode {
	const { schemaPack, translationNs } = useResourceDetailContext();
	const t = useTranslate(translationNs);
	const testAttrs = useResourceDetailTestAttrs();
	const updateContext = React.useContext(ResourceUpdateContext);
	const createContext = React.useContext(ResourceCreateContext);
	const view = useResourceFormView();

	const resource = updateContext?.resource;
	const existingUrl = readString(resource, props.urlField);
	const isCreate = Boolean(createContext && !updateContext);
	const editable = isCreate || Boolean(view?.updateMode && updateContext?.commands.update);
	const registerAfterSave = updateContext?.registerAfterSave ?? createContext?.registerAfterSave;

	const [file, setFile] = React.useState<File | null>(null);
	const [removed, setRemoved] = React.useState(false);
	const previewUrl = useObjectPreviewUrl(file) ?? (removed ? null : existingUrl);

	React.useEffect(() => {
		setFile(null);
		setRemoved(false);
	}, [resource, view?.updateMode]);

	useFileFieldAfterSave(props.field, registerAfterSave, schemaPack, {
		file,
		removed,
		hadFile: Boolean(existingUrl),
		orgId: readString(resource, 'org_id') ?? undefined,
	});

	const selectFile = (next: File | null) => {
		if (next && next.size > props.maxBytes) {
			return;
		}
		setFile(next);
	};

	const clear = () => {
		if (file) {
			setFile(null);
			return;
		}
		setRemoved(true);
	};

	return (
		<Stack gap='xs' {...testAttrs('fileField', props.field)}>
			<Text size='sm' fw={500}>{t(props.label)}</Text>
			{editable && (
				<FileInput
					accept={props.accept.join(',')}
					value={file}
					onChange={selectFile}
					clearable
					{...testAttrs('fileField', props.field, 'input')}
				/>
			)}
			{previewUrl
				? (
					<Group align='flex-end' gap='sm'>
						<Image src={previewUrl} alt={t(props.label)} mah={144} maw={180} fit='contain' />
						{editable && (
							<Button
								variant='subtle'
								size='compact-sm'
								onClick={clear}
								{...testAttrs('fileField', props.field, 'remove')}
							>
								{t('action.delete')}
							</Button>
						)}
					</Group>
				)
				: !editable && <Text size='sm' c='dimmed'>—</Text>}
		</Stack>
	);
}

function useFileFieldAfterSave(
	field: string,
	registerAfterSave: RegisterAfterSave | undefined,
	schemaPack: SchemaPack | null,
	pending: PendingFile,
): void {
	const pendingRef = React.useRef<PendingFile>(pending);
	pendingRef.current = pending;

	React.useEffect(() => {
		if (!registerAfterSave || !schemaPack) {
			return undefined;
		}
		return registerAfterSave(async (saved: SavedRecord) => {
			const current = pendingRef.current;
			const orgId = (typeof saved.values.org_id === 'string' ? saved.values.org_id : undefined) ?? current.orgId;
			if (current.file) {
				const result = await schemaPack.restApi.uploadFile({
					id: saved.id,
					field,
					file: current.file,
					replace: current.hadFile,
					etag: saved.etag,
					org_id: orgId,
				});
				return unwrapResult(result)?.etag;
			}
			if (current.removed && current.hadFile) {
				const result = await schemaPack.restApi.deleteFile({
					id: saved.id,
					field,
					etag: saved.etag,
					org_id: orgId,
				});
				return unwrapResult(result)?.etag;
			}
			return saved.etag;
		});
	}, [registerAfterSave, schemaPack, field]);
}

function useObjectPreviewUrl(file: File | null): string | null {
	const [url, setUrl] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (!file) {
			setUrl(null);
			return undefined;
		}
		const objectUrl = URL.createObjectURL(file);
		setUrl(objectUrl);
		return () => URL.revokeObjectURL(objectUrl);
	}, [file]);

	return url;
}
