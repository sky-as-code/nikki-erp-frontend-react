import { AutoField, EntityDisplayField, EntitySelectField } from '@nikkierp/ui/components/form';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { Org } from '@/features/identities';


interface RoleFormFieldsProps {
	isCreate: boolean;
	orgs?: Org[];
}

export const RoleFormFields: React.FC<RoleFormFieldsProps> = ({ isCreate, orgs = [] }) => {
	const { t: translate } = useTranslation();

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
				htmlProps={!isCreate ? {
					readOnly: true,
				} : undefined}
				inputProps={{
					disabled: !isCreate,
				}}
			/>
			<AutoField
				name='isRequiredAttachment'
				htmlProps={!isCreate ? {
					readOnly: true,
				} : undefined}
				inputProps={{
					disabled: !isCreate,
				}}
			/>
			<AutoField
				name='isRequiredComment'
				htmlProps={!isCreate ? {
					readOnly: true,
				} : undefined}
				inputProps={{
					disabled: !isCreate,
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

