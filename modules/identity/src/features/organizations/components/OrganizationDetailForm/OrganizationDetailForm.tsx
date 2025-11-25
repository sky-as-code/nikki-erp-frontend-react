import {
	Paper,
	Stack,
	TextInput,
	Text,
} from '@mantine/core';
import {
	FormStyleProvider,
	FormFieldProvider,
	AutoField,
} from '@nikkierp/ui/components/form';
import { FieldConstraint, FieldDefinition } from '@nikkierp/ui/model';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ButtonDetailPage } from '../../../../components/ButtonDetailPage';


type OrganizationSchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

interface OrganizationDetailFormProps {
	schema: OrganizationSchema;
	organizationDetail: any;
	isLoading: boolean;
	onSubmit: (data: any) => void;
	onDelete: () => void;
}

export function OrganizationDetailForm({ schema, organizationDetail, isLoading,
	onSubmit, onDelete }: OrganizationDetailFormProps): React.ReactElement {
	const { t } = useTranslation();
	return (
		<Paper withBorder p='xl'>
			<FormStyleProvider layout='onecol'>
				<FormFieldProvider
					formVariant='update'
					modelSchema={schema}
					modelValue={organizationDetail}
				>
					{({ handleSubmit, form }) => (
						<form onSubmit={handleSubmit(onSubmit)} noValidate>
							<Stack gap='xl'>
								<ButtonDetailPage
									onDelete={onDelete}
									isLoading={isLoading}
									disableSave={!form.formState.isDirty}
								/>
								<Stack gap='md'>
									<div>
										<Text size='sm' fw={500} mb='xs'>
											{t('nikki.identity.organization.fields.slug')}
										</Text>
										<TextInput
											value={organizationDetail?.slug || ''}
											size='md'
											variant='filled'
											readOnly
										/>
									</div>
									<AutoField name='displayName' inputProps={{ disabled: isLoading }} />
									<AutoField name='legalName' inputProps={{ disabled: isLoading }} />
									<AutoField name='phoneNumber' inputProps={{ disabled: isLoading }} />
									<AutoField name='address' inputProps={{ disabled: isLoading }} />
									<AutoField name='status' inputProps={{ disabled: isLoading }} />
									<div>
										<Text size='sm' fw={500} mb='xs'>
											{t('nikki.identity.organization.fields.createdAt')}
										</Text>
										<TextInput
											value={organizationDetail?.createdAt ? new Date(organizationDetail.createdAt).toLocaleString() : ''}
											size='md'
											variant='filled'
											readOnly
										/>
									</div>
									<div>
										<Text size='sm' fw={500} mb='xs'>
											{t('nikki.identity.organization.fields.updatedAt')}
										</Text>
										<TextInput
											value={organizationDetail?.updatedAt ? new Date(organizationDetail.updatedAt).toLocaleString() : ''}
											size='md'
											variant='filled'
											readOnly
										/>
									</div>
								</Stack>

							</Stack>
						</form>
					)}
				</FormFieldProvider>
			</FormStyleProvider>
		</Paper>
	);
}
