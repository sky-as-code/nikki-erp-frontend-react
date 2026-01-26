import { AutoField, EntityDisplayField, EntitySelectField, useFormField } from '@nikkierp/ui/components/form';
import React from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useOwnerSelectLogic } from '../../hooks/useOwnerSelectLogic';

import type { OwnerType } from '../../types';
import type { Group, Org, User } from '@/features/identities';


interface RoleFormFieldsProps {
	isCreate: boolean;
	orgs?: Org[];
	users?: User[];
	groups?: Group[];
}

// eslint-disable-next-line max-lines-per-function
export const RoleFormFields: React.FC<RoleFormFieldsProps> = ({
	isCreate,
	orgs = [],
	users = [],
	groups = [],
}) => {
	const { t: translate } = useTranslation();
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

	const globalOption = React.useMemo(() => [
		{
			value: '',
			label: translate('nikki.authorize.role.fields.org_all'),
		},
	], []);

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

