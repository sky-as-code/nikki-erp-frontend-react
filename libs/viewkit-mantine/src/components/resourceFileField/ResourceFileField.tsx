import { FileInput, Group, Image, Stack, Text } from '@mantine/core';
import { storageFileUrlOf } from '@nikkierp/common/request';
import { Button } from '@nikkierp/ui/components';
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

	const [file, setFile] = React.useState<File | null>(null);
	const [removed, setRemoved] = React.useState(false);
	const previewUrl = useObjectPreviewUrl(file) ?? (removed ? null : existingUrl);

	React.useEffect(() => {
		setFile(null);
		setRemoved(false);
	}, [resource, view?.updateMode]);

	useFileFieldContribution(props.fileIdField, registerFileField, toStagedFile(file, removed, Boolean(existingUrl)));

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
