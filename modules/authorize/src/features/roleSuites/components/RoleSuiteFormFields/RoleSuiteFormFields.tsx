import { AutoField, EntityDisplayField, EntitySelectField } from '@nikkierp/ui/components/form';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ALL_ORGS_VALUE } from '@/features/roleSuites/validation/roleSuiteFormValidation';

import type { Org } from '@/features/orgs';



interface RoleSuiteFormFieldsProps {
	isCreate: boolean;
	orgs?: Org[];
	onOrgIdChange?: (orgId: string | undefined) => void;
}

function BaseFields({ isCreate }: { isCreate: boolean }) {
	return (
		<>
			{!isCreate && <AutoField name='id' />}
			<AutoField
				name='name'
				autoFocused
			/>
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
		</>
	);
}

function BooleanFields({ isCreate }: { isCreate: boolean }) {
	return (
		<>
			<AutoField name='isRequestable'
				inputProps={{
					disabled: !isCreate,
				}}
				htmlProps={!isCreate ? {
					readOnly: true,
				} : undefined}/>
			<AutoField name='isRequiredAttachment'
				inputProps={{
					disabled: !isCreate,
				}}
				htmlProps={!isCreate ? {
					readOnly: true,
				} : undefined}/>
			<AutoField name='isRequiredComment'
				inputProps={{
					disabled: !isCreate,
				}}
				htmlProps={!isCreate ? {
					readOnly: true,
				} : undefined}/>
		</>
	);
}

function OrgIdField({ isCreate, orgs, onOrgIdChange }: {
	isCreate: boolean;
	orgs?: Org[];
	onOrgIdChange?: (orgId: string | undefined) => void;
}) {
	const { t: translate } = useTranslation();

	if (isCreate) {
		return (
			<EntitySelectField
				fieldName='orgId'
				entities={orgs}
				getEntityId={(o) => o.id}
				getEntityName={(o) => o.displayName}
				prependOptions={[{
					value: '',
					label: translate('nikki.authorize.role_suite.fields.org_all'),
				}]}
				onChange={(val) => {
					// Convert empty string to undefined (domain level)
					const newOrgId = (val === '' || val === ALL_ORGS_VALUE) ? undefined : val;
					onOrgIdChange?.(newOrgId);
				}}
				selectProps={{
					clearable: false,
				}}
			/>
		);
	}

	return (
		<EntityDisplayField
			fieldName='orgId'
			entities={orgs}
			getEntityId={(o) => o.id}
			getEntityName={(o) => o.displayName}
			fallbackLabelKey='nikki.authorize.role_suite.fields.org_all'
		/>
	);
}

export const RoleSuiteFormFields: React.FC<RoleSuiteFormFieldsProps> = ({
	isCreate,
	orgs,
	onOrgIdChange,
}) => (
	<>
		<BaseFields isCreate={isCreate} />
		<BooleanFields isCreate={isCreate} />
		<OrgIdField isCreate={isCreate} orgs={orgs} onOrgIdChange={onOrgIdChange} />
	</>
);
