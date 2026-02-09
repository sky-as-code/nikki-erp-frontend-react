/* eslint-disable max-lines-per-function */
import {
	Group,
	Paper,
	Stack,
	Title,
} from '@mantine/core';
import {
	AutoField,
	EntitySelectField,
	FormActions,
	FormFieldProvider,
	FormStyleProvider,
} from '@nikkierp/ui/components/form';
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';

import { PageContainer } from '../../components/PageContainer';
import {
	UNIT_DEFAULT_VALUES,
	useUnitCreateHandlers,
} from '../../features/unit/hooks';
import unitSchema from '../../schemas/unit-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';


const UNIT_SCHEMA = unitSchema as ModelSchema;

export const UnitCreatePageBody: React.FC = () => {
	const {
		unitCategories,
		isSubmitting,
		onSubmit,
		handleGoBack,
	} = useUnitCreateHandlers();

	return (
		<PageContainer>
			<Stack gap='md'>
				<Title order={2}>Create Unit</Title>
				<FormStyleProvider layout='onecol'>
					<FormFieldProvider
						formVariant='create'
						modelSchema={UNIT_SCHEMA}
						modelLoading={isSubmitting}
						modelValue={UNIT_DEFAULT_VALUES}
					>
						{({ handleSubmit }) => (
							<Paper p='md' withBorder>
								<form onSubmit={handleSubmit(onSubmit)} noValidate>
									<Stack gap='md'>
										<AutoField name='name' autoFocused inputProps={{ disabled: isSubmitting }} />
										<AutoField name='symbol' inputProps={{ disabled: isSubmitting }} />
										<EntitySelectField
											fieldName='categoryId'
											entities={unitCategories}
											getEntityId={(category) => category.id}
											getEntityName={(category) => category.name}
											placeholder='Select unit category'
											shouldDisable={isSubmitting}
											selectProps={{ clearable: false }}
										/>
										<Group justify='flex-end' mt='md'>
											<FormActions
												isSubmitting={isSubmitting}
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

export const UnitCreatePage = withWindowTitle('Create Unit', UnitCreatePageBody);
