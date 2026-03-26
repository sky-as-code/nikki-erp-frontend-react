/* eslint-disable max-lines-per-function */
import {
	Group,
	Paper,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import {
	AutoField,
	FormActions,
	FormFieldProvider,
	FormStyleProvider,
} from '@nikkierp/ui/components/form';
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';

import { PageContainer } from '../../components/PageContainer';
import {
	useProductCategoryCreateHandlers,
} from '../../features/productCategory/hooks';
import categorySchema from '../../schemas/product-category-schema.json';
import { ControlPanelAction } from '../../components/ControlPanel';

import type { ModelSchema } from '@nikkierp/ui/model';
import { useNavigate } from 'react-router';


const CATEGORY_SCHEMA = categorySchema as ModelSchema;

export const ProductCategoryCreatePageBody: React.FC = () => {
	const {
		isLoading,
		onSubmit,
		handleGoBack,
	} = useProductCategoryCreateHandlers();
	const navigate = useNavigate();

	return (
		<PageContainer
			breadcrumbs={[
				{ title: 'Inventory', href: '../overview' },
				{ title: 'Product Categories', href: '../product-categories' },
				{ title: 'Create Product Category', href: '#' },
			]}
			sections={[
				<ControlPanelAction
					actions={[
						{ label: 'Create', type: 'submit'},
						{ label: 'Cancel', variant: 'outline', onClick: () => navigate(-1) },
					]}
				/>,
			]}
		>
			<FormStyleProvider layout='onecol'>
				<FormFieldProvider
					formVariant='create'
					modelSchema={CATEGORY_SCHEMA}
					modelLoading={isLoading}
				>
					{({ handleSubmit }) => (
						<Paper p='md' withBorder>
							<form onSubmit={handleSubmit(onSubmit)} noValidate>
								<Stack gap='md'>
									<AutoField name='name' autoFocused inputProps={{ disabled: isLoading }} />
								</Stack>
							</form>
						</Paper>
					)}
				</FormFieldProvider>
			</FormStyleProvider>
		</PageContainer>
	);
};

export const ProductCategoryCreatePage = withWindowTitle(
	'Create Product Category',
	ProductCategoryCreatePageBody,
);

