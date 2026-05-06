/* eslint-disable max-lines-per-function */
import { ConfirmModal, withWindowTitle } from '@nikkierp/ui/components';
import { IconArrowLeft, IconDeviceFloppy, IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import React, { useCallback } from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';

import { ControlPanel } from '../../components/ControlPanel';
import { useUnitCategoryDetail } from '../../features/unitCategory/hooks';
import { UnitCategoryDetailForm } from '../../features/unitCategory/components';
import categorySchema from '../../schemas/unit-category-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';
import { PageContainer } from '../../components/PageContainer';
import { JsonToString } from '../../utils/serializer';

export const UnitCategoryDetailPageBody: React.FC = () => {
	const { t } = useTranslation();
	const { categoryId } = useParams<{ categoryId?: string }>();
	const [isEditing, setIsEditing] = React.useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

	const {
		isLoading,
		isSubmitting,
		category,
		handleGoBack,
		onSave,
		onDelete,
		units,
		onDeleteUnit,
	} = useUnitCategoryDetail({ categoryId });

	const handleSaveClick = useCallback(() => {
		const el = document.getElementById('unit-category-detail-form');
		if (el instanceof HTMLFormElement) {
			el.requestSubmit();
		}
	}, []);

	const breadcrumbs = [
		{ title: t('nikki.inventory.breadcrumbs.home'), href: '../overview' },
		{ title: t('nikki.inventory.menu.unitCategories'), href: '../unit-categories' },
		{ title: category?.name ? JsonToString(category.name) : t('nikki.inventory.breadcrumbs.unitCategoryDetails'), href: '#' },
	];

	return (
		<>
			<PageContainer
				breadcrumbs={breadcrumbs}
				isLoading={isLoading}
				isNotFound={!category && !isLoading}
				sections={[
					<ControlPanel
						actions={[
							{
								label: t('nikki.general.actions.back'),
								leftSection: <IconArrowLeft size={16} />,
								onClick: handleGoBack,
								variant: 'outline' as const,
								type: 'button' as const,
							},
							...(!isEditing ? [{
								label: t('nikki.general.actions.edit'),
								leftSection: <IconEdit size={16} />,
								onClick: () => setIsEditing(true),
								type: 'button' as const,
							}] : [{
								label: t('nikki.general.actions.save'),
								leftSection: <IconDeviceFloppy size={16} />,
								onClick: handleSaveClick,
								type: 'button' as const,
								variant: 'filled' as const,
							}, {
								label: t('nikki.general.actions.cancel'),
								leftSection: <IconX size={16} />,
								onClick: () => setIsEditing(false),
								variant: 'outline' as const,
								type: 'button' as const,
							}]),
							{
								label: t('nikki.general.actions.delete'),
								leftSection: <IconTrash size={16} />,
								onClick: () => setShowDeleteConfirm(true),
								variant: 'outline' as const,
								type: 'button' as const,
								color: 'red',
							},
						]}
					/>,
				]}
			>
				<UnitCategoryDetailForm
					schema={categorySchema as ModelSchema}
					category={category ?? undefined}
					isSubmitting={isSubmitting}
					isEditing={isEditing}
					onSave={onSave}
					units={units}
					onDeleteUnit={onDeleteUnit}
				/>
			</PageContainer>
			<ConfirmModal
				opened={showDeleteConfirm}
				onClose={() => setShowDeleteConfirm(false)}
				onConfirm={() => { setShowDeleteConfirm(false); void onDelete(); }}
				title={t('nikki.inventory.unitCategory.messages.confirmDeleteTitle')}
				message={t('nikki.inventory.unitCategory.messages.confirmDeleteMessage')}
				confirmLabel={t('nikki.general.actions.delete')}
				confirmColor='red'
			/>
		</>
	);
};

export const UnitCategoryDetailPage = withWindowTitle('Unit Category Details', UnitCategoryDetailPageBody);

