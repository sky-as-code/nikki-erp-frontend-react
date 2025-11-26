import {
	Stack,
} from '@mantine/core';
import { FormModal } from '@nikkierp/ui/components';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';

import resourceSchema from '../resource-schema.json';
import { ResourceFormActions, ResourceFormFields } from './ResourceFormFields';
import useResourceFormHandlers from '../hooks/useResouceFormHandlers';
import { ResourceFormModalProps } from '../hooks/useResouceFormHandlers';


export const ResourceFormModal: React.FC<ResourceFormModalProps> = (props: ResourceFormModalProps) => {
	const schema = resourceSchema as ModelSchema;
	const handlers = useResourceFormHandlers(props);

	return (
		<FormModal
			opened={props.opened}
			onClose={() => handlers.safeClose()}
			title={handlers.modalTitle}
			formVariant={handlers.isCreate ? 'create' : 'update'}
			modelSchema={schema}
			modelValue={handlers.modalModelValue}
			modelLoading={handlers.isSubmitting}
		>
			{({ handleSubmit, form }) => (
				<form onSubmit={handleSubmit((data) => handlers.submit(data, form))} noValidate>
					<Stack gap='xs'>
						<ResourceFormFields isCreate={handlers.isCreate} />
						<ResourceFormActions
							isSubmitting={handlers.isSubmitting}
							onCancel={handlers.safeClose}
							isCreate={handlers.isCreate}
						/>
					</Stack>
				</form>
			)}
		</FormModal>
	);
};
