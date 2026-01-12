import { AutoField, EntityDisplayField, EntitySelectField, useFormField } from '@nikkierp/ui/components/form';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { Org } from '@/features/orgs';


function useFieldReadOnly(fieldName: string): boolean {
	const { getFieldDef, formVariant } = useFormField();
	const fieldDef = getFieldDef(fieldName);

	if (!fieldDef?.readOnly) return false;

	return fieldDef.readOnly[formVariant] === true;
}

interface RoleFormFieldsProps {
	isCreate: boolean;
	orgs?: Org[];
}

export const RoleFormFields: React.FC<RoleFormFieldsProps> = ({ isCreate, orgs = [] }) => {
	const { t: translate } = useTranslation();
	const isRequestableReadOnly = useFieldReadOnly('isRequestable');
	const isRequiredAttachmentReadOnly = useFieldReadOnly('isRequiredAttachment');
	const isRequiredCommentReadOnly = useFieldReadOnly('isRequiredComment');

	const globalOption = React.useMemo(() => [
		{
			value: '',
			label: translate('nikki.authorize.role.fields.org_all'),
		},
	], [translate]);

	return (
		<>
			{!isCreate && <AutoField name='id' />}
			<AutoField name='name' autoFocused />
			<AutoField name='description' />
			<AutoField
				name='ownerType'
				htmlProps={!isCreate ? {
					readOnly: true,
				} : undefined}
			/>
			<AutoField
				name='ownerRef'
				htmlProps={!isCreate ? {
					readOnly: true,
				} : undefined}
			/>
			<AutoField
				name='isRequestable'
				inputProps={{
					disabled: isRequestableReadOnly,
				}}
			/>
			<AutoField
				name='isRequiredAttachment'
				inputProps={{
					disabled: isRequiredAttachmentReadOnly,
				}}
			/>
			<AutoField
				name='isRequiredComment'
				inputProps={{
					disabled: isRequiredCommentReadOnly,
				}}
			/>
			{isCreate ? (
				<EntitySelectField
					fieldName='orgId'
					entities={orgs}
					getEntityId={(o) => o.id}
					getEntityName={(o) => o.displayName}
					prependOptions={globalOption}
				/>
			) : (
				<EntityDisplayField
					fieldName='orgId'
					entities={orgs}
					getEntityId={(o) => o.id}
					getEntityName={(o) => o.displayName}
					fallbackLabelKey='nikki.authorize.role.fields.org_all'
				/>
			)}
		</>
	);
};

