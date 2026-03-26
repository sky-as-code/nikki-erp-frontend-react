import { Stack } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useNavigate } from 'react-router';

import { selectAttributeDetail } from '../../appState/attribute';
import { DetailControlPanel } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { AttributeDetailForm } from '../../features/attribute/components';
import { useAttributeDetailHandlers } from '../../features/attribute/hooks';
import { JsonToString } from '../../utils/serializer';
import { selectProductDetail } from '../../appState/product';


export const AttributeDetailPageBody: React.FC = () => {
	const attributeDetail = useMicroAppSelector(selectAttributeDetail);
	const productDetail = useMicroAppSelector(selectProductDetail);
	const navigate = useNavigate();

	const { isLoadingDetail, handleUpdate, handleDelete } = useAttributeDetailHandlers();

	const attributeData = attributeDetail?.data
		? { ...attributeDetail.data }
		: undefined;

	const breadcrumbs = [
		{ title: 'Inventory', href: '../overview' },
		{ title: 'Products', href: '../products' },
		{ title: productDetail?.data?.name ? JsonToString(productDetail.data.name) : 'Product Detail', href: `../products/${productDetail?.data?.id}` },
		{ title: 'Attributes', href: '#' },
		{ title: attributeData?.displayName ? JsonToString(attributeData.displayName) : 'Attribute Detail', href: '#' },
	];

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			sections={[
				<DetailControlPanel
					onGoBack={() => navigate(-1)}
					onDelete={() => handleDelete()}
				/>,
			]}
		>
			<Stack gap='md'>
				<AttributeDetailForm
					attributeDetail={attributeData}
					isLoading={isLoadingDetail}
					onSubmit={handleUpdate}
					onDelete={handleDelete}
				/>
			</Stack>
		</PageContainer>
	);
};

export const AttributeDetailPage = withWindowTitle('Attribute Detail', AttributeDetailPageBody);