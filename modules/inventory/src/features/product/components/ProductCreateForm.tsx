import {
	Group,
	Paper,
	Stack,
} from '@mantine/core';
import {
	AutoField,
	EntitySelectField,
	FormActions,
	FormContainer,
	FormFieldProvider,
	FormStyleProvider,
} from '@nikkierp/ui/components/form';
import React from 'react';
import { useNavigate } from 'react-router';

import productSchema from '../../../schemas/product-schema.json';
import { StringToJson, JsonToString } from '../../../utils/serializer';

import type { Unit } from '../../unit/types';
import type { CreateProductRequest } from '../types';
import type { ModelSchema } from '@nikkierp/ui/model';


export type ProductCreateSubmitPayload = Omit<CreateProductRequest, 'orgId'>;

type ProductFormValues = {
	name: string;
	sku: string;
	barCode: string;
	description: string;
	unitId?: string;
	status?: 'active' | 'inactive';
	thumbnailURL: string;
	proposedPrice?: number;
};

interface ProductCreateFormProps {
	isLoading: boolean;
	units: Unit[];
	onSubmit: (data: ProductCreateSubmitPayload) => void;
}

const PRODUCT_CREATE_SCHEMA = productSchema as ModelSchema;

const PRODUCT_DEFAULT_VALUES: ProductFormValues = {
	name: '',
	sku: '',
	barCode: '',
	description: '',
	unitId: undefined,
	status: 'active',
	thumbnailURL: '',
	proposedPrice: undefined,
};

type ProductCreateFormContentProps = {
	isLoading: boolean;
	onSubmit: (data: ProductCreateSubmitPayload) => void;
	handleGoBack: () => void;
	units: Unit[];
	handleSubmit: (
		onValid: (data: any) => void | Promise<void>,
	) => (e?: React.BaseSyntheticEvent) => Promise<void>;
};

function ProductCreateFormContent({
	isLoading,
	onSubmit,
	units,
	handleSubmit,
}: ProductCreateFormContentProps): React.ReactElement {

	const submitForm = React.useCallback((rawValues: any) => {
		const values = rawValues as ProductFormValues;
		
		onSubmit({
			name: StringToJson(values.name),
			sku: values.sku,
			barCode: values.barCode,
			description: StringToJson(values.description),
			unitId: values.unitId,
			status: values.status,
			thumbnailURL: values.thumbnailURL,
			proposedPrice: values.proposedPrice,
		});
	}, [onSubmit]);

	return (
		<Paper>
			<form onSubmit={handleSubmit(submitForm)} noValidate>
				<Stack gap='lg'>
					<FormContainer>
						<Stack gap='sm'>
							<AutoField name='name' autoFocused inputProps={{ disabled: isLoading }} />
							<AutoField name='sku' inputProps={{ disabled: isLoading }} />
							<AutoField name='barCode' inputProps={{ disabled: isLoading }} />
							<AutoField name='description' inputProps={{ disabled: isLoading }} />
							<AutoField name='thumbnailURL' inputProps={{ disabled: isLoading }} />
							<AutoField name='proposedPrice' inputProps={{ disabled: isLoading }} />
							<AutoField name='status' inputProps={{ disabled: isLoading }} />
							<EntitySelectField
								fieldName='unitId'
								entities={units}
								getEntityId={(unit) => unit.id}
								getEntityName={(unit) => `${JsonToString(unit.name)} (${unit.symbol ?? ''})`}
								placeholder='Select unit'
								shouldDisable={isLoading}
							/>
						</Stack>
					</FormContainer>
				</Stack>
			</form>
		</Paper>
	);
}

export function ProductCreateForm({ isLoading, units, onSubmit }: ProductCreateFormProps): React.ReactElement {
	const navigate = useNavigate();

	const handleGoBack = () => {
		navigate(-1);
	};

	return (
		<FormStyleProvider layout='onecol'>
			<FormFieldProvider
				formVariant='create'
				modelSchema={PRODUCT_CREATE_SCHEMA}
				modelLoading={isLoading}
				modelValue={PRODUCT_DEFAULT_VALUES}
			>
				{({ handleSubmit }) => (
					<ProductCreateFormContent
						isLoading={isLoading}
						onSubmit={onSubmit}
						handleGoBack={handleGoBack}
						units={units}
						handleSubmit={handleSubmit}
					/>
				)}
			</FormFieldProvider>
		</FormStyleProvider>
	);
}
