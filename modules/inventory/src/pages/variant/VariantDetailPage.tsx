import { IconArrowLeft, IconDeviceFloppy, IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ControlPanel } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { VariantDetailForm } from '../../features/variant/components/VariantDetailForm';
import { useVariantDetailHandlers } from '../../features/variant/hooks/useVariantDetail';
import variantSchema from '../../schemas/variant-schema.json';
import { JsonToString } from '../../utils/serializer';

import type { VariantDetailFormHandle } from '../../features/variant/components/VariantDetailForm';
import type { ModelSchema } from '@nikkierp/ui/model';


export const VariantDetailPageBody: React.FC = () => {
	const { t: translate } = useTranslation();
	const [isEditing, setIsEditing] = React.useState(false);
	const formRef = React.useRef<VariantDetailFormHandle | null>(null);
	const { 
		isLoadingDetail, 
		handleUpdate, 
		handleDelete, 
		handleGoBack, 
		productDetail, 
		variantDetail 
	} = useVariantDetailHandlers();
	const variant = variantDetail?.data;

	const handleEdit = React.useCallback(() => {
		setIsEditing(true);
	}, []);

	const handleCancelEdit = React.useCallback(() => {
		setIsEditing(false);
	}, []);

	const handleSave = React.useCallback(() => {
		formRef.current?.submit();
	}, []);

	const handleDeleteClick = React.useCallback(() => {
		formRef.current?.triggerDelete();
	}, []);

	const breadcrumbs = [
		{ title: 'Inventory', href: '..' },
		{ title: 'Products', href: '../products' },
		{ title: productDetail?.data?.name ? JsonToString(productDetail.data.name) : 'Product Detail', href: `../products/${productDetail?.data?.id}` },
		{ title: 'Variants', href: '../product-variants' },
		{ title: variant?.name ? JsonToString(variant.name) : 'Variant', href: '#' },
	];

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			isLoading={isLoadingDetail}
			sections={[
				<ControlPanel
					actions={[
						{
							label: translate('nikki.general.actions.back'),
							leftSection: <IconArrowLeft size={16} />,
							onClick: handleGoBack,
							variant: 'outline',
						},
						...(!isEditing ? [{
							label: translate('nikki.general.actions.edit'),
							leftSection: <IconEdit size={16} />,
							onClick: handleEdit,
							variant: 'filled' as const,
						}] : [{
							label: translate('nikki.general.actions.save'),
							leftSection: <IconDeviceFloppy size={16} />,
							onClick: handleSave,
							variant: 'filled' as const,
						}, {
							label: translate('nikki.general.actions.cancel'),
							leftSection: <IconX size={16} />,
							onClick: handleCancelEdit,
							variant: 'outline' as const,
						}]),
						{
							label: translate('nikki.general.actions.delete'),
							leftSection: <IconTrash size={16} />,
							onClick: handleDeleteClick,
							variant: 'outline',
							color: 'red',
						},
					]}
				/>,
			]}
		>
			<VariantDetailForm
				ref={formRef}
				schema={variantSchema as ModelSchema}
				variantDetail={variant}
				isLoading={isLoadingDetail}
				isEditing={isEditing}
				onSubmit={handleUpdate}
				onDelete={handleDelete}
			/>
		</PageContainer>
	);
};

export const VariantDetailPage: React.FC = withWindowTitle('Variant Detail', VariantDetailPageBody);
