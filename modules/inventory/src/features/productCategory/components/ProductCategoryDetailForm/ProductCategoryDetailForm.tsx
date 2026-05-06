import { Paper, Stack, Text, TextInput, ActionIcon, Group } from '@mantine/core';
import {
	AutoTable,
	ConfirmModal,
} from '@nikkierp/ui/components';
import {
	AutoField,
	FormFieldProvider,
	FormStyleProvider,
} from '@nikkierp/ui/components/form';
import { ModelSchema } from '@nikkierp/ui/model';
import { IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { JsonToString } from '../../../../utils/serializer';
import productSchema from '../../../../schemas/product-schema.json';
import type { ProductCategoryDetailFormValues } from '../../hooks/useProductCategoryDetail';
import type { ProductCategory } from '../../types';
import type { Product } from '../../../product/types';

const PRODUCT_SCHEMA = productSchema as ModelSchema;
const PRODUCT_COLUMNS = ['name', 'status'];

const UPDATE_FORM_FIELDS = ['name'];

interface ProductCategoryDetailFormProps {
	schema: ModelSchema;
	category: ProductCategory | undefined;
	isSubmitting: boolean;
	isEditing: boolean;
	onSave: (values: ProductCategoryDetailFormValues) => void;
	products: Product[];
	onDeleteProduct: (id: string) => void | Promise<void>;
}

export function ProductCategoryDetailForm({
	schema,
	category,
	isSubmitting,
	isEditing,
	onSave,
	products,
	onDeleteProduct,
}: ProductCategoryDetailFormProps): React.ReactElement {
	const { t } = useTranslation();
	const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; label: string } | null>(null);

	const modelValue = {
		...category,
		name: JsonToString(category?.name),
	};

	const isReadOnly = !isEditing || isSubmitting;

	const updateSchema = React.useMemo((): ModelSchema => ({
		...schema,
		fields: Object.fromEntries(
			Object.entries(schema.fields).map(([key, field]) => [
				key,
				UPDATE_FORM_FIELDS.includes(key) ? field : { ...field, frontendOnly: true },
			]),
		),
	}), [schema]);

	const handleConfirmDelete = React.useCallback(async () => {
		if (!deleteTarget) return;
		const targetId = deleteTarget.id;
		setDeleteTarget(null);
		await onDeleteProduct(targetId);
	}, [deleteTarget, onDeleteProduct]);

	return (
		<>
			<FormStyleProvider layout='onecol'>
				<FormFieldProvider
					formVariant='update'
					modelSchema={updateSchema}
					modelLoading={isSubmitting}
					modelValue={modelValue}
				>
					{({ handleSubmit }) => (
						<Paper p='md' withBorder>
							<form id='product-category-detail-form' onSubmit={handleSubmit(onSave)} noValidate>
								<Stack gap='md'>
									<AutoField name='name' htmlProps={{ readOnly: isReadOnly }} />
									<div>
										<Text size='sm' fw={500} mb='xs'>
											{t('nikki.identity.user.fields.createdAt')}
										</Text>
										<TextInput
											value={category?.createdAt ? new Date(category.createdAt).toLocaleString() : ''}
											size='md'
											variant='filled'
											readOnly
										/>
									</div>
									<div>
										<Text size='sm' fw={500} mb='xs'>
											{t('nikki.identity.user.fields.updatedAt')}
										</Text>
										<TextInput
											value={category?.updatedAt ? new Date(category.updatedAt).toLocaleString() : ''}
											size='md'
											variant='filled'
											readOnly
										/>
									</div>
								</Stack>
							</form>
						</Paper>
					)}
				</FormFieldProvider>
			</FormStyleProvider>

			<Paper p='md' withBorder mt='md'>
				<Stack gap='md'>
					<Group justify='space-between'>
						<Text fw={600}>{t('nikki.inventory.product.title')}</Text>
					</Group>
					{products.length === 0 ? (
						<Text c='dimmed' ta='center' py='md'>
							{t('nikki.inventory.product.messages.emptyInCategory')}
						</Text>
					) : (
						<AutoTable
							schema={PRODUCT_SCHEMA}
							data={products as unknown as Record<string, unknown>[]}
							columns={[...PRODUCT_COLUMNS, 'actions']}
							columnRenderers={{
								name: (row) => JsonToString((row as Product).name) || (row as Product).id,
								actions: (row) => (
									<ActionIcon
										aria-label='Delete product'
										color='red'
										variant='light'
										onClick={() => setDeleteTarget({
											id: (row as Product).id,
											label: JsonToString((row as Product).name) || (row as Product).id,
										})}
									>
										<IconTrash size={16} />
									</ActionIcon>
								),
							}}
							headerRenderers={{
								actions: () => t('nikki.general.actions.title'),
							}}
						/>
					)}
				</Stack>
			</Paper>

			<ConfirmModal
				opened={deleteTarget !== null}
				onClose={() => setDeleteTarget(null)}
				onConfirm={() => void handleConfirmDelete()}
				title={t('nikki.inventory.product.messages.confirmDeleteTitle')}
				message={t('nikki.inventory.product.messages.confirmDeleteMessage')}
				confirmLabel={t('nikki.general.actions.delete')}
				confirmColor='red'
			/>
		</>
	);
}
