/* eslint-disable max-lines-per-function */
import {
	Paper,
	Stack,
	Title,
} from '@mantine/core';
import {
	AutoField,
	EntitySelectField,
	FormFieldProvider,
	FormStyleProvider,
} from '@nikkierp/ui/components/form';
import { DetailView, LoadingState, NotFound, withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { useParams } from 'react-router';

import { DetailActionBar } from '../../components/ActionBar/DetailActionBar';
import { PageContainer } from '../../components/PageContainer';
import { useUnitDetail } from '../../features/unit/hooks';
import unitSchema from '../../schemas/unit-schema.json';

import type { ModelSchema } from '@nikkierp/ui/model';


const UNIT_SCHEMA = unitSchema as ModelSchema;

export const UnitDetailPageBody: React.FC = () => {
	const { unitId } = useParams();
	const {
		isLoading,
		isSubmitting,
		unit,
		categoryOptions,
		modelValue,
		handleGoBack,
		onSave,
		onDelete,
	} = useUnitDetail({ unitId });

	if (isLoading) {
		return <LoadingState messageKey='nikki.general.messages.loading' minHeight={320} />;
	}

	if (!unit) {
		return <NotFound onGoBack={handleGoBack} messageKey='nikki.inventory.messages.unitNotFound' />;
	}

	return (
		<FormStyleProvider layout='onecol'>
			<FormFieldProvider
				formVariant='update'
				modelSchema={UNIT_SCHEMA}
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
							<Title order={2}>Unit Details</Title>
							<Paper p='md' withBorder>
								<form onSubmit={handleSubmit(onSave)} noValidate>
									<Stack gap='md'>
										<AutoField name='name' inputProps={{ disabled: isSubmitting }} />
										<AutoField name='symbol' inputProps={{ disabled: isSubmitting }} />
										<EntitySelectField
											fieldName='categoryId'
											entities={categoryOptions}
											getEntityId={(item) => item.id}
											getEntityName={(item) => item.name}
											shouldDisable={isSubmitting}
											selectProps={{ clearable: false }}
										/>
										<DetailView
											schema={UNIT_SCHEMA}
											data={unit as unknown as Record<string, unknown>}
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

export const UnitDetailPage = withWindowTitle('Unit Details', UnitDetailPageBody);
