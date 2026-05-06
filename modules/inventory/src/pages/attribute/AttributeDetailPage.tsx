import { ConfirmModal, withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import { IconArrowLeft, IconDeviceFloppy, IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { selectAttributeDetail } from '../../appState/attribute';
import { selectProductDetail } from '../../appState/product';
import { ControlPanel } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { AttributeDetailForm } from '../../features/attribute/components';
import { useAttributeDetailHandlers } from '../../features/attribute/hooks';
import { JsonToString } from '../../utils/serializer';



export const AttributeDetailPageBody: React.FC = () => {
	const { t: translate } = useTranslation();
	const attributeDetail = useMicroAppSelector(selectAttributeDetail);
	const productDetail = useMicroAppSelector(selectProductDetail);
	const navigate = useNavigate();
	const [isEditing, setIsEditing] = React.useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

	const { isLoadingDetail, handleUpdate, handleDelete } = useAttributeDetailHandlers();

	const handleSaveClick = useCallback(() => {
		const el = document.getElementById('attribute-detail-form');
		if (el instanceof HTMLFormElement) {
			el.requestSubmit();
		}
	}, []);

	const attributeData = attributeDetail?.data
		? { ...attributeDetail.data }
		: undefined;

	const breadcrumbs = [
		{ title: translate('nikki.inventory.breadcrumbs.home'), href: '../overview' },
		{ title: translate('nikki.inventory.menu.products'), href: '../products' },
		{ title: productDetail?.data?.name ? JsonToString(productDetail.data.name) : translate('nikki.inventory.breadcrumbs.productDetail'), href: `../products/${productDetail?.data?.id}` },
		{ title: translate('nikki.inventory.menu.attributes'), href: '#' },
		{ title: attributeData?.displayName ? JsonToString(attributeData.displayName) : translate('nikki.inventory.breadcrumbs.attributeDetail'), href: '#' },
	];

	return (
		<>
			<PageContainer
				breadcrumbs={breadcrumbs}
				isLoading={isLoadingDetail}
				isNotFound={!attributeData}
				sections={[
					<ControlPanel
						actions={[
							{
								label: translate('nikki.general.actions.back'),
								onClick: () => navigate(-1),
								leftSection: <IconArrowLeft size={16} />,
								variant: 'outline' as const,
							},
							...(!isEditing ? [{
								label: translate('nikki.general.actions.edit'),
								leftSection: <IconEdit size={16} />,
								onClick: () => setIsEditing(true),
								variant: 'filled' as const,
								type: 'button' as const,
							}] : [{
								label: translate('nikki.general.actions.save'),
								leftSection: <IconDeviceFloppy size={16} />,
								type: 'button' as const,
								variant: 'filled' as const,
								form: 'attribute-detail-form',
								onClick: handleSaveClick,
							}, {
								label: translate('nikki.general.actions.cancel'),
								leftSection: <IconX size={16} />,
								onClick: () => setIsEditing(false),
								variant: 'outline' as const,
							}]),
							{
								label: translate('nikki.general.actions.delete'),
								leftSection: <IconTrash size={16} />,
								onClick: () => setShowDeleteConfirm(true),
								variant: 'outline' as const,
								color: 'red',
							},
						]}
					/>,
				]}
			>
				<AttributeDetailForm
					attributeDetail={attributeData}
					isLoading={isLoadingDetail}
					isEditing={isEditing}
					onSubmit={handleUpdate}
				/>
			</PageContainer>
			<ConfirmModal
				opened={showDeleteConfirm}
				onClose={() => setShowDeleteConfirm(false)}
				onConfirm={() => { setShowDeleteConfirm(false); handleDelete(); }}
				title={translate('nikki.inventory.attribute.messages.confirmDeleteTitle')}
				message={translate('nikki.inventory.attribute.messages.confirmDeleteMessage')}
				confirmLabel={translate('nikki.general.actions.delete')}
				confirmColor='red'
			/>
		</>
	);
};

export const AttributeDetailPage = withWindowTitle('Attribute Detail', AttributeDetailPageBody);