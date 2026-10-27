import { FileInput, Group, Image, Stack, Text } from '@mantine/core';
import { storageFileUrlOf } from '@nikkierp/common/request';
import { Button } from '@nikkierp/ui/components';
import { useCrudFormRuntime } from '@nikkierp/ui/components/form';
import { useTranslate } from '@nikkierp/ui/i18n';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import React from 'react';

import { toStagedFile, useFileFieldContribution, useObjectPreviewUrl } from './fileFieldHooks';
import { resourceFileFieldPropsSchema } from './props';
import { RESOURCE_FILE_FIELD } from '../../ids';
import { ResourceCreateContext } from '../../pages/resourceDetail/resourceCreateContext';
import {
	useResourceDetailContext, useResourceDetailTestAttrs,
} from '../../pages/resourceDetail/ResourceDetailProvider';
import { ResourceUpdateContext } from '../../pages/resourceDetail/resourceUpdateContext';
import { useResourceFormView } from '../resourceFormViewContext';

import type { ResourceFileFieldProps } from './props';
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

function ResourceFileField({ props }: { props: ResourceFileFieldProps }): React.ReactNode {
	const { translationNs } = useResourceDetailContext();
	const t = useTranslate(translationNs);
	const testAttrs = useResourceDetailTestAttrs();
	const updateContext = React.useContext(ResourceUpdateContext);
	const createContext = React.useContext(ResourceCreateContext);
	const view = useResourceFormView();

	const resource = updateContext?.resource;
	const existingUrl = storageFileUrlOf(resource?.[props.fileIdField]);
	const isCreate = Boolean(createContext && !updateContext);
	const editable = isCreate || Boolean(view?.updateMode && updateContext?.commands.update);
	const registerFileField = updateContext?.registerFileField ?? createContext?.registerFileField;
	const kind = useFileKind(props.kindField, resource);
	const accept = acceptedTypes(props, kind);

	const [file, setFile] = React.useState<File | null>(null);
	const [removed, setRemoved] = React.useState(false);
	const [rejected, setRejected] = React.useState(false);
	const stagedUrl = useObjectPreviewUrl(file);

	React.useEffect(() => {
		setFile(null);
		setRemoved(false);
	}, [resource, view?.updateMode]);

	useFileFieldContribution(props.fileIdField, registerFileField, toStagedFile(file, removed, Boolean(existingUrl)));

	const selectFile = (next: File | null) => {
		const refused = Boolean(next && accept && !accept.includes(next.type));
		setRejected(refused);
		if (!refused && !(next && next.size > props.maxBytes)) {
			setFile(next);
		}
	};
	const previewUrl = removed ? null : existingUrl ?? (editable ? null : stagedUrl);
	const hint = fileHint(props, kind, rejected);

	return (
		<Stack gap='xs' {...testAttrs('fileField', props.field)}>
			<Text size='sm' fw={500}>{t(props.label)}</Text>
			{editable && (
				<FileInput
					accept={(accept ?? props.accept).join(',')}
					value={file}
					onChange={selectFile}
					disabled={Boolean(props.kindField && props.acceptByKind && !accept)}
					error={hint && rejected ? t(hint) : undefined}
					description={hint && !rejected ? t(hint) : undefined}
					clearable
					{...testAttrs('fileField', props.field, 'input')}
				/>
			)}
			{editable && file && stagedUrl && (
				<FilePreview url={stagedUrl} isVideo={file.type.startsWith('video/')} size={96} alt={file.name} />
			)}
			{previewUrl
				? (
					<Group align='flex-end' gap='sm'>
						<FilePreview url={previewUrl} isVideo={kind === 'video'} size={180} alt={t(props.label)} controls />
						{editable && (
							<Button
								variant='subtle'
								size='compact-sm'
								onClick={() => setRemoved(true)}
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

/**
 * The value of `kindField`: from the form while one is open, so a create picks up the type chosen a
 * moment ago, else from the stored record.
 */
function useFileKind(kindField: string | undefined, resource: Record<string, unknown> | undefined): string | undefined {
	const form = useCrudFormRuntime()?.form;
	const live = kindField && form ? form.watch(kindField) : undefined;
	const value = live ?? (kindField ? resource?.[kindField] : undefined);
	return typeof value === 'string' && value ? value : undefined;
}

/** The MIME types the picker takes, or `undefined` while a kind-aware picker waits for its kind. */
export function acceptedTypes(props: ResourceFileFieldProps, kind: string | undefined): string[] | undefined {
	if (!props.kindField || !props.acceptByKind) {
		return props.accept;
	}
	return kind ? props.acceptByKind[kind] : undefined;
}

function fileHint(props: ResourceFileFieldProps, kind: string | undefined, rejected: boolean): string | undefined {
	if (!props.kindHints) {
		return undefined;
	}
	if (rejected) {
		return props.kindHints.wrongType;
	}
	return props.kindField && !kind ? props.kindHints.pickFirst : undefined;
}

function FilePreview({ url, isVideo, size, alt, controls }: {
	url: string, isVideo: boolean, size: number, alt: string, controls?: boolean,
}): React.ReactNode {
	if (isVideo) {
		return (
			<video src={url} controls={controls} muted={!controls} preload='metadata'
				style={{ maxHeight: size * 0.8, maxWidth: size, display: 'block' }}
			/>
		);
	}
	return <Image src={url} alt={alt} mah={size * 0.8} maw={size} fit='contain' />;
}
