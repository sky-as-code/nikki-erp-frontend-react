import { Modal, Title } from '@mantine/core';
import React from 'react';

import { ModelSchema } from '../../model';
import { FormFieldProvider, FormStyleProvider } from '../form';


export interface FormDialogProps {
	opened: boolean;
	onClose: () => void;
	title: string;
	formVariant: 'create' | 'update';
	modelSchema: ModelSchema;
	modelValue?: Record<string, unknown>;
	modelLoading?: boolean;
	children: (props: {
		handleSubmit: (
			onValid: (data: unknown) => void | Promise<void>,
		) => (e?: React.BaseSyntheticEvent) => Promise<void>;
		reset: () => void;
	}) => React.ReactNode;
	size?: string | number;
	layout?: 'onecol' | 'twocol';
}

export const FormDialog: React.FC<FormDialogProps> = ({
	opened,
	onClose,
	title,
	formVariant,
	modelSchema,
	modelValue,
	modelLoading = false,
	children,
	size = 'lg',
	layout = 'onecol',
}) => {
	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={<Title order={4}>{title}</Title>}
			size={size}
		>
			<FormStyleProvider layout={layout}>
				<FormFieldProvider
					formVariant={formVariant}
					modelSchema={modelSchema}
					modelValue={modelValue}
					modelLoading={modelLoading}
				>
					{({ handleSubmit, reset }) => children({ handleSubmit, reset })}
				</FormFieldProvider>
			</FormStyleProvider>
		</Modal>
	);
};

