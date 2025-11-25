import { Modal, Title } from '@mantine/core';
import React from 'react';

import { ModelSchema } from '../../model';
import { FormFieldProvider, FormStyleProvider } from '../form';

import type { UseFormReturn } from 'react-hook-form';


export interface FormModalProps {
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
		form: UseFormReturn<any>;
	}) => React.ReactNode;
	size?: string | number;
	layout?: 'onecol' | 'twocol';
}

export const FormModal: React.FC<FormModalProps> = ({
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
			centered
		>
			<FormStyleProvider layout={layout}>
				<FormFieldProvider
					formVariant={formVariant}
					modelSchema={modelSchema}
					modelValue={modelValue}
					modelLoading={modelLoading}
				>
					{({ handleSubmit, reset, form }) => children({ handleSubmit, reset, form })}
				</FormFieldProvider>
			</FormStyleProvider>
		</Modal>
	);
};

