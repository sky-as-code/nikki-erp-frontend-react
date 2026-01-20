import {
	Paper,
	Select,
	Stack,
} from '@mantine/core';
import {
	FormFieldProvider,
	FormStyleProvider,
	AutoField,
} from '@nikkierp/ui/components';
import { FieldConstraint, FieldDefinition } from '@nikkierp/ui/model';
import React from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ListActionCreatePage } from '../../../../components/ListActionBar';
import { HierarchyLevel } from '../../types';


type HierarchySchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

interface HierarchyCreateFormProps {
	schema: HierarchySchema;
	hierarchies: HierarchyLevel[];
	isCreating: boolean;
	onSubmit: (data: any) => void;
}

export function HierarchyCreateForm({
	schema, hierarchies, isCreating, onSubmit,
}: HierarchyCreateFormProps): React.ReactElement {
	const { t } = useTranslation();

	const parentOptions = React.useMemo(() => [
		{ value: '', label: t('nikki.identity.hierarchy.noParent') },
		...hierarchies.map((h) => ({
			value: h.id,
			label: h.name,
		})),
	], [hierarchies, t]);

	return (
		<Paper className='p-4' shadow='sm'>
			<FormStyleProvider layout='onecol'>
				<FormFieldProvider
					formVariant='create'
					modelSchema={schema}
				>
					{({ handleSubmit, form }) => (
						<form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete='off'>
							<Stack gap='md'>
								<Stack gap='md'>
									<AutoField
										name='name'
										autoFocused
										inputProps={{
											disabled: isCreating,
										}}
									/>
									<Controller
										name='parentId'
										control={form.control}
										render={({ field }) => (
											<Select
												label={t('nikki.identity.hierarchy.fields.parentId') || 'Parent Hierarchy'}
												data={parentOptions}
												value={field.value || ''}
												onChange={(value) => field.onChange(value || undefined)}
												disabled={isCreating}
												clearable
												searchable
												size='md'
											/>
										)}
									/>
								</Stack>

								<ListActionCreatePage
									isLoading={isCreating}
								/>
							</Stack>
						</form>
					)}
				</FormFieldProvider>
			</FormStyleProvider>
		</Paper>
	);
}
