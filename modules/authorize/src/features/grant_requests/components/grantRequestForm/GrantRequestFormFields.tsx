import { Paper, Stack, Title } from '@mantine/core';
import { AutoField, EntityDisplayField, EntitySelectField } from '@nikkierp/ui/components/form';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useReceiverSelectLogic, useTargetSelectLogic } from '@/pages/grant_requests/hooks';

import type { Group } from '@/features/identities';
import type { User } from '@/features/identities';
import type { Org } from '@/features/orgs';
import type { RoleSuite } from '@/features/role_suites';
import type { Role } from '@/features/roles';


interface TargetFieldsProps {
	isCreate: boolean;
	roles?: Role[];
	roleSuites?: RoleSuite[];
}

function TargetFields({ isCreate, roles, roleSuites }: TargetFieldsProps) {
	const { t: translate } = useTranslation();
	const { availableTargets, shouldDisable, placeholder } = useTargetSelectLogic(roles, roleSuites);

	return (
		<Paper p='md' withBorder>
			<Title order={5} mb='md'>
				{translate('nikki.authorize.grant_request.fields.target')}
			</Title>
			<Stack gap='xs'>
				<AutoField
					name='targetType'
					htmlProps={!isCreate ? { readOnly: true } : undefined}
				/>
				{isCreate ? (
					<EntitySelectField
						fieldName='targetRef'
						entities={availableTargets}
						getEntityId={(t) => t.id}
						getEntityName={(t) => t.name}
						shouldDisable={shouldDisable}
						placeholder={placeholder}
					/>
				) : (
					<AutoField
						name='targetName'
						htmlProps={{ readOnly: true }}
					/>
				)}
			</Stack>
		</Paper>
	);
}

interface ReceiverFieldsProps {
	isCreate: boolean;
	users?: User[];
	groups?: Group[];
}

function ReceiverFields({ isCreate, users, groups }: ReceiverFieldsProps) {
	const { t: translate } = useTranslation();
	const { availableReceivers, shouldDisable, placeholder } = useReceiverSelectLogic(users, groups);

	return (
		<Paper p='md' withBorder>
			<Title order={5} mb='md'>
				{translate('nikki.authorize.grant_request.fields.receiver')}
			</Title>
			<Stack gap='xs'>
				<AutoField
					name='receiverType'
					htmlProps={!isCreate ? { readOnly: true } : undefined}
				/>
				{isCreate ? (
					<EntitySelectField
						fieldName='receiverId'
						entities={availableReceivers}
						getEntityId={(r) => r.id}
						getEntityName={(r) => r.name}
						shouldDisable={shouldDisable}
						placeholder={placeholder}
					/>
				) : (
					<AutoField
						name='receiverName'
						htmlProps={{ readOnly: true }}
					/>
				)}
			</Stack>
		</Paper>
	);
}

interface CommonFieldsProps {
	isCreate: boolean;
	orgs?: Org[];
}

function CommonFields({ isCreate, orgs = [] }: CommonFieldsProps) {
	const { t: translate } = useTranslation();

	const globalOption = React.useMemo(() => [
		{
			value: '',
			label: translate('nikki.authorize.grant_request.fields.org_all'),
		},
	], [translate]);

	return (
		<Paper p='md' withBorder>
			<Title order={5} mb='md'>
				{translate('nikki.authorize.grant_request.fields.other_info')}
			</Title>
			<Stack gap='xs'>
				{!isCreate && (
					<AutoField
						name='requestorName'
						htmlProps={{ readOnly: true }}
					/>
				)}
				<AutoField
					name='comment'
					htmlProps={!isCreate ? { readOnly: true } : undefined}
				/>
				<AutoField
					name='attachmentUrl'
					htmlProps={!isCreate ? { readOnly: true } : undefined}
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
						fallbackLabelKey='nikki.authorize.grant_request.fields.org_all'
					/>
				)}
				{!isCreate && (
					<AutoField name='status' htmlProps={{ readOnly: true }} />
				)}
			</Stack>
		</Paper>
	);
}

interface GrantRequestFormFieldsProps {
	isCreate: boolean;
	roles?: Role[];
	roleSuites?: RoleSuite[];
	users?: User[];
	groups?: Group[];
	orgs?: Org[];
}

export const GrantRequestFormFields: React.FC<GrantRequestFormFieldsProps> = ({
	isCreate,
	roles,
	roleSuites,
	users,
	groups,
	orgs,
}) => (
	<Stack gap='md'>
		<TargetFields isCreate={isCreate} roles={roles} roleSuites={roleSuites} />
		<ReceiverFields isCreate={isCreate} users={users} groups={groups} />
		<CommonFields isCreate={isCreate} orgs={orgs} />
	</Stack>
);
