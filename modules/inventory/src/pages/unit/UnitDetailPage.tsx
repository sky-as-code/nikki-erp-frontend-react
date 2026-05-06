import { ConfirmModal, withWindowTitle } from '@nikkierp/ui/components';
import { IconArrowLeft, IconDeviceFloppy, IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanel } from '../../components/ControlPanel';

import { PageContainer } from '../../components/PageContainer';
import { useUnitDetail } from '../../features/unit/hooks';
import { UnitDetailForm } from '../../features/unit/components';
import unitSchema from '../../schemas/unit-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';
import { JsonToString } from '../../utils/serializer';

export const UnitDetailPageBody: React.FC = () => {
	const { t: translate } = useTranslation();
	const {
		isLoading,
		isSubmitting,
		unit,
		units,
		categoryOptions,
		handleGoBack,
		onSave,
		onDelete,
	} = useUnitDetail();

	const [isEditing, setIsEditing] = React.useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

	const handleSaveClick = useCallback(() => {
		const el = document.getElementById('unit-detail-form');
		if (el instanceof HTMLFormElement) {
			el.requestSubmit();
		}
	}, []);

	const breadcrumbs = [
		{ title: translate('nikki.inventory.breadcrumbs.home'), href: '../overview' },
		{ title: translate('nikki.inventory.menu.units'), href: '../units' },
		{ title: unit?.name ? JsonToString(unit.name) : translate('nikki.inventory.breadcrumbs.unitDetails'), href: '#' },
	];

	return (
		<>
			<PageContainer
				breadcrumbs={breadcrumbs}
				isLoading={isLoading}
				isNotFound={!unit && !isLoading}
				sections={[
					<ControlPanel
						actions={[
							{
								label: translate('nikki.general.actions.back'),
								leftSection: <IconArrowLeft size={16} />,
								onClick: handleGoBack,
								variant: 'outline' as const,
								type: 'button' as const,
							},
							...(!isEditing ? [{
								label: translate('nikki.general.actions.edit'),
								leftSection: <IconEdit size={16} />,
								onClick: () => setIsEditing(true),
								type: 'button' as const,
							}] : [{
								label: translate('nikki.general.actions.save'),
								leftSection: <IconDeviceFloppy size={16} />,
								onClick: handleSaveClick,
								type: 'button' as const,
								variant: 'filled' as const,
								form: 'unit-detail-form',
							}, {
								label: translate('nikki.general.actions.cancel'),
								leftSection: <IconX size={16} />,
								onClick: () => setIsEditing(false),
								variant: 'outline' as const,
								type: 'button' as const,
							}]),
							{
								label: translate('nikki.general.actions.delete'),
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
				<UnitDetailForm
					schema={unitSchema as ModelSchema}
					unit={unit}
					units={units}
					unitCategories={categoryOptions}
					isLoading={isLoading}
					isSubmitting={isSubmitting}
					isEditing={isEditing}
					onSave={onSave}
				/>
			</PageContainer>
			<ConfirmModal
				opened={showDeleteConfirm}
				onClose={() => setShowDeleteConfirm(false)}
				onConfirm={() => { setShowDeleteConfirm(false); void onDelete(); }}
				title={translate('nikki.inventory.unit.messages.confirmDeleteTitle')}
				message={translate('nikki.inventory.unit.messages.confirmDeleteMessage')}
				confirmLabel={translate('nikki.general.actions.delete')}
				confirmColor='red'
			/>
		</>
	);
};

export const UnitDetailPage = withWindowTitle('Unit Details', UnitDetailPageBody);
