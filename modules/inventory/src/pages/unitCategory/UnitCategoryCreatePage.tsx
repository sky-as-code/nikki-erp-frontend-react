/* eslint-disable max-lines-per-function */
import {
	Group,
	Paper,
	Stack,
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
	UNIT_CATEGORY_DEFAULT_VALUES,
	useUnitCategoryCreateHandlers,
} from '../../features/unitCategory/hooks';
import categorySchema from '../../schemas/unit-category-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';


const CATEGORY_SCHEMA = categorySchema as ModelSchema;

export const UnitCategoryCreatePageBody: React.FC = () => {
	const {
		isLoading,
		onSubmit,
		handleGoBack,
	} = useUnitCategoryCreateHandlers();

	return (
		<PageContainer>
			<Stack gap='md'>
				<Title order={2}>Create Unit Category</Title>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						formVariant='create'
						modelSchema={CATEGORY_SCHEMA}
						modelLoading={isLoading}
						modelValue={UNIT_CATEGORY_DEFAULT_VALUES}
					>
						{({ handleSubmit }) => (
							<Paper p='md' withBorder>
								<form onSubmit={handleSubmit(onSubmit)} noValidate>
									<Stack gap='md'>
										<AutoField name='name' autoFocused inputProps={{ disabled: isLoading }} />
										<Group justify='flex-end' mt='md'>
											<FormActions
												isSubmitting={isLoading}
												onCancel={handleGoBack}
												isCreate
											/>
										</Group>
									</Stack>
								</form>
							</Paper>
						)}
					</FormFieldProvider>
				</FormStyleProvider>
			</Stack>
		</PageContainer>
	);
};

export const UnitCategoryCreatePage = withWindowTitle(
	'Create Unit Category',
	UnitCategoryCreatePageBody,
);
