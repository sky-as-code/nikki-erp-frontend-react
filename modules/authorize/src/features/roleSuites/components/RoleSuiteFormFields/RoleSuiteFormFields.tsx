import { AutoField, EntityDisplayField, EntitySelectField, useFormField } from '@nikkierp/ui/components/form';
import React from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useOwnerSelectLogic } from '../../hooks/useOwnerSelectLogic';

import type { Group, Org, User } from '@/features/identities';
import type { OwnerType } from '@/features/roles';

import { ALL_ORGS_VALUE } from '@/features/roleSuites/helpers/roleSuiteFormValidation';


interface RoleSuiteFormFieldsProps {
	isCreate: boolean;
	orgs?: Org[];
	users?: User[];
	groups?: Group[];
	onOrgIdChange?: (orgId: string | undefined) => void;
}

function BaseFields({ isCreate, users, groups }: { isCreate: boolean; users?: User[]; groups?: Group[] }) {
	const { control } = useFormField();
	const ownerLogic = useOwnerSelectLogic(users, groups);

	const ownerType = useWatch({
		control,
		name: 'ownerType',
	}) as OwnerType | undefined;

	const displayEntities = React.useMemo(() => {
		if (ownerType === 'user' && users) {
			return users.map((u) => ({ id: u.id, name: u.displayName }));
		}
		if (ownerType === 'group' && groups) {
			return groups.map((g) => ({ id: g.id, name: g.name }));
		}
		return [
			...(users?.map((u) => ({ id: u.id, name: u.displayName })) ?? []),
			...(groups?.map((g) => ({ id: g.id, name: g.name })) ?? []),
		];
	}, [ownerType, users, groups]);

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
			{isCreate ? (
				<EntitySelectField
					fieldName='ownerRef'
					entities={ownerLogic.availableOwners}
					getEntityId={(o) => o.id}
					getEntityName={(o) => o.name}
					shouldDisable={ownerLogic.shouldDisable}
					placeholder={ownerLogic.placeholder}
				/>
			) : (
				<EntityDisplayField
					fieldName='ownerRef'
					entities={displayEntities}
					getEntityId={(o) => o.id}
					getEntityName={(o) => o.name}
				/>
			)}
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
	users,
	groups,
	onOrgIdChange,
}) => (
	<>
		<BaseFields isCreate={isCreate} users={users} groups={groups} />
		<BooleanFields isCreate={isCreate} />
		<OrgIdField isCreate={isCreate} orgs={orgs} onOrgIdChange={onOrgIdChange} />
	</>
);
