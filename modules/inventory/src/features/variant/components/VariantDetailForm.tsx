import {
	Badge,
	Box,
	Grid,
	Group,
	Image,
	Stack,
	Text,
} from '@mantine/core';
import { ConfirmModal } from '@nikkierp/ui/components';
import {
	AutoField,
	FormStyleProvider,
	FormFieldProvider,
} from '@nikkierp/ui/components/form';
import {
	IconBox,
} from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { JsonToString } from '../../../utils/serializer';

import type { FieldConstraint, FieldDefinition, ModelSchema } from '@nikkierp/ui/model';
import type { Variant } from '../types';


function formatDateTime(value: unknown): string {
	if (value === null || value === undefined || value === '') {
		return '-';
	}

	const date = new Date(String(value));
	return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function formatVariantAttributeValue(value: unknown): string {
	if (typeof value === 'string') {
		return value;
	}

	if (typeof value === 'number') {
		return String(value);
	}

	if (typeof value === 'boolean') {
		return value ? 'Yes' : 'No';
	}

	if (!value || typeof value !== 'object') {
		return '-';
	}

	const record = value as Record<string, unknown>;
	const localizedText = JsonToString(record.valueText);
	if (localizedText) {
		return localizedText;
	}

	if (typeof record.valueText === 'string') {
		return record.valueText;
	}

	if (typeof record.valueNumber === 'number') {
		return String(record.valueNumber);
	}

	if (typeof record.valueBool === 'boolean') {
		return record.valueBool ? 'Yes' : 'No';
	}

	if (typeof record.valueRef === 'string') {
		return record.valueRef;
	}

	if (typeof record.id === 'string') {
		return record.id;
	}

	return JsonToString(value) || '-';
}

function getVariantAttributes(attributes: unknown): Array<{ codeName: string; value: unknown }> {
	if (Array.isArray(attributes)) {
		return attributes.reduce<Array<{ codeName: string; value: unknown }>>((acc, attribute) => {
			if (!attribute || typeof attribute !== 'object') {
				return acc;
			}

			const record = attribute as Record<string, unknown>;
			if (typeof record.codeName !== 'string') {
				return acc;
			}

			acc.push({
				codeName: record.codeName,
				value: record.value,
			});

			return acc;
		}, []);
	}

	if (!attributes || typeof attributes !== 'object') {
		return [];
	}

	return Object.entries(attributes as Record<string, unknown>).map(([codeName, value]) => ({
		codeName,
		value,
	}));
}

type VariantSchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

interface VariantDetailFormProps {
	schema: ModelSchema | VariantSchema;
	variantDetail: Variant | undefined;
	isLoading: boolean;
	isEditing: boolean;
	onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
	onDelete: () => void | Promise<void>;
}

export interface VariantDetailFormHandle {
	submit: () => void;
	triggerDelete: () => void;
}

export const VariantDetailForm = React.forwardRef<VariantDetailFormHandle, VariantDetailFormProps>(({ 
	schema,
	variantDetail,
	isLoading,
	isEditing,
	onSubmit,
	onDelete,
}, ref): React.ReactElement => {
	const { t } = useTranslation();
	const [showSaveConfirm, setShowSaveConfirm] = React.useState(false);
	const [pendingData, setPendingData] = React.useState<Record<string, unknown> | null>(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
	const formRef = React.useRef<HTMLFormElement | null>(null);

	React.useImperativeHandle(ref, () => ({
		submit: () => formRef.current?.requestSubmit(),
		triggerDelete: () => setShowDeleteConfirm(true),
	}), []);

	const handleFormSubmit = (data: Record<string, unknown>) => {
		setPendingData(data);
		setShowSaveConfirm(true);
	};

	const handleConfirmSave = () => {
		if (pendingData) {
			void onSubmit(pendingData);
			setPendingData(null);
		}
	};

	const handleConfirmDelete = () => {
		setShowDeleteConfirm(false);
		void onDelete();
	};

	const variantName = variantDetail ? (JsonToString(variantDetail.name) || variantDetail.id || '-') : '-';
	const attributes = variantDetail ? getVariantAttributes(variantDetail.attributes) : [];
	const isFormReadOnly = isLoading || !variantDetail || !isEditing;

	const getStatusLabel = (status: string | undefined) => {
		const statusMap: Record<string, { color: string; label: string }> = {
			active: { color: 'green', label: t('nikki.general.status.active') },
			inactive: { color: 'gray', label: t('nikki.general.status.inactive') },
		};
		const statusInfo = statusMap[status || ''] || { color: 'gray', label: status || '-' };
		return <Badge color={statusInfo.color}>{statusInfo.label}</Badge>;
	};

	return (
		<>
			<FormStyleProvider layout='onecol'>
				<FormFieldProvider
					formVariant='update'
					modelSchema={schema}
					modelValue={variantDetail}
					modelLoading={isLoading}
				>
					{({ handleSubmit }) => {
						return (
							<form ref={formRef} onSubmit={handleSubmit(handleFormSubmit)} noValidate>
								<Stack gap='md'>
									{/* Header */}
									<Group gap='xs' mb='md'>
										<IconBox size={20} />
										<Text fw={600} size='lg'>{variantName}</Text>
									</Group>

									{/* Status */}
									<div>
										<Text size='sm' c='dimmed' mb='xs'>
											{t('nikki.inventory.variant.fields.status')}
										</Text>
										{getStatusLabel(variantDetail?.status)}
									</div>

									<AutoField name='sku' htmlProps={{ readOnly: isFormReadOnly }} />
									<AutoField name='barcode' htmlProps={{ readOnly: isFormReadOnly }} />
									<AutoField name='proposedPrice' htmlProps={{ readOnly: isFormReadOnly }} />

									{/* Image URL */}
									<div>
										<AutoField name='imageURL' htmlProps={{ readOnly: isFormReadOnly }} />
										{variantDetail?.imageURL && (
											<Image
												src={variantDetail.imageURL}
												alt={variantName}
												h={140}
												w='auto'
												fit='contain'
												radius='md'
												mt='sm'
												fallbackSrc='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect width="400" height="200" fill="%23f1f3f5"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23868e96"%3ENo Image%3C/text%3E%3C/svg%3E'
											/>
										)}
									</div>

									{/* Attributes Section */}
									<div>
										{attributes.length > 0 ? (
											<Grid gutter='sm'>
												{attributes.map((attribute) => (
													<Grid.Col key={attribute.codeName} span={{ base: 12, sm: 6 }}>
														<Group gap='xs' wrap='nowrap'>
															<Badge size='sm' variant='light' radius='sm'>
																{attribute.codeName}
															</Badge>
															<Text size='sm' fw={500}>
																{formatVariantAttributeValue(attribute.value)}
															</Text>
														</Group>
													</Grid.Col>
												))}
											</Grid>
										) : (
											<Text size='sm' c='dimmed'>
												{t('nikki.inventory.variant.messages.noAttributes')}
											</Text>
										)}
									</div>

									{/* Timestamps */}
									<div>
										<Text size='sm' c='dimmed' mb='xs'>
											{t('nikki.inventory.variant.fields.createdAt')}
										</Text>
										<Text size='sm'>{formatDateTime(variantDetail?.createdAt)}</Text>
									</div>

									<div>
										<Text size='sm' c='dimmed' mb='xs'>
											{t('nikki.inventory.variant.fields.updatedAt')}
										</Text>
										<Text size='sm'>{formatDateTime(variantDetail?.updatedAt)}</Text>
									</div>

									<Box h={50} />
								</Stack>
							</form>
						);
					}}
				</FormFieldProvider>
			</FormStyleProvider>

			<ConfirmModal
				opened={showSaveConfirm}
				onClose={() => setShowSaveConfirm(false)}
				onConfirm={handleConfirmSave}
				title={t('nikki.inventory.variant.actions.confirmUpdate')}
				message={t('nikki.inventory.variant.messages.confirmUpdateMessage')}
				confirmLabel={t('nikki.inventory.variant.actions.save')}
			/>

			<ConfirmModal
				opened={showDeleteConfirm}
				onClose={() => setShowDeleteConfirm(false)}
				onConfirm={handleConfirmDelete}
				title={t('nikki.inventory.variant.actions.confirmDelete')}
				message={t('nikki.inventory.variant.messages.confirmDeleteMessage')}
				confirmLabel={t('nikki.inventory.variant.actions.delete')}
				confirmColor='red'
			/>
		</>
	);
});

VariantDetailForm.displayName = 'VariantDetailForm';
