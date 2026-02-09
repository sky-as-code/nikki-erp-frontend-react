/* eslint-disable max-lines-per-function */
import {
	Paper,
	Stack,
	Title,
} from '@mantine/core';
import {
	AutoField,
	FormFieldProvider,
	FormStyleProvider,
} from '@nikkierp/ui/components/form';
import { DetailView, LoadingState, NotFound, withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { useParams } from 'react-router';

import { DetailActionBar } from '../../components/ActionBar/DetailActionBar';
import { PageContainer } from '../../components/PageContainer';
import { useProductCategoryDetail } from '../../features/productCategory/hooks';
import categorySchema from '../../schemas/product-category-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';


const CATEGORY_SCHEMA = categorySchema as ModelSchema;

export const ProductCategoryDetailPageBody: React.FC = () => {
	const { categoryId } = useParams();
	const {
		isLoading,
		isSubmitting,
		category,
		modelValue,
		handleGoBack,
		onSave,
		onDelete,
	} = useProductCategoryDetail({ categoryId });

	if (isLoading) {
		return <LoadingState messageKey='nikki.general.messages.loading' minHeight={320} />;
	}

	if (!category) {
		return <NotFound onGoBack={handleGoBack} messageKey='nikki.inventory.messages.productNotFound' />;
	}

	return (
		<FormStyleProvider layout='onecol'>
			<FormFieldProvider
				formVariant='update'
				modelSchema={CATEGORY_SCHEMA}
				modelLoading={isSubmitting}
				modelValue={modelValue}
			>
				{({ handleSubmit }) => (
					<PageContainer
						actionBar={
							<DetailActionBar
								onSave={() => void handleSubmit(onSave)()}
								onGoBack={handleGoBack}
								onDelete={() => void onDelete()}
							/>
						}
					>
						<Stack gap='md'>
							<Title order={2}>Product Category Details</Title>
							<Paper p='md' withBorder>
								<form onSubmit={handleSubmit(onSave)} noValidate>
									<Stack gap='md'>
										<AutoField name='name' inputProps={{ disabled: isSubmitting }} />
										<DetailView
											schema={CATEGORY_SCHEMA}
											data={category as unknown as Record<string, unknown>}
											fields={[]}
											showMetadata
										/>
									</Stack>
								</form>
							</Paper>
						</Stack>
					</PageContainer>
				)}
			</FormFieldProvider>
		</FormStyleProvider>
	);
};

export const ProductCategoryDetailPage = withWindowTitle(
	'Product Category Details',
	ProductCategoryDetailPageBody,
);

