import { Paper, Select, Stack, Title } from '@mantine/core';
import { AutoField, EntityDisplayField, EntitySelectField } from '@nikkierp/ui/components/form';
import React from 'react';
import { useTranslation } from 'react-i18next';


import type { Group } from '@/features/identities';
import type { User } from '@/features/identities';
import type { Org } from '@/features/identities';
import type { Role } from '@/features/roles';
import type { RoleSuite } from '@/features/roleSuites';

import { useReceiverSelectLogic, useTargetSelectLogic } from '@/features/grantRequests/hooks';


interface TargetFieldsProps {
	isCreate: boolean;
	roles?: Role[];
	roleSuites?: RoleSuite[];
	orgs?: Org[];
	selectedOrgId?: string | null;
	onOrgIdChange?: (orgId: string | null | undefined) => void;
}

function TargetFields({
	isCreate,
	roles,
	roleSuites,
	orgs = [],
	selectedOrgId,
	onOrgIdChange,
}: TargetFieldsProps) {
	const { t: translate } = useTranslation();
	const { availableTargets, shouldDisable, placeholder } = useTargetSelectLogic(roles, roleSuites, selectedOrgId);
	const targetFilterOptions = React.useMemo(() => [
		{
			value: '',
			label: translate('nikki.authorize.grant_request.fields.org_all'),
		},
		...orgs.map((org) => ({
			value: org.id,
			label: org.displayName,
		})),
	], [orgs]);

	return (
		<Paper p='md' withBorder>
			<Title order={5} mb='md'>
				{translate('nikki.authorize.grant_request.fields.target')}
			</Title>
			<Stack gap='xs'>
				{isCreate && (
					<Select
						label={translate('nikki.authorize.grant_request.fields.org')}
						data={targetFilterOptions}
						placeholder='Select target scope'
						value={selectedOrgId === undefined ? null : (selectedOrgId ?? '')}
						onChange={(value) => {
							if (value === null) {
								onOrgIdChange?.(undefined);
								return;
							}
							onOrgIdChange?.(value === '' ? null : value);
						}}
						clearable
					/>
				)}
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
	orgs?: Org[];
	selectedOrgId?: string | null;
	onOrgIdChange?: (orgId: string | null | undefined) => void;
}

function ReceiverFields({
	isCreate,
	users,
	groups,
	orgs = [],
	selectedOrgId,
	onOrgIdChange,
}: ReceiverFieldsProps) {
	const { t: translate } = useTranslation();
	const { availableReceivers, shouldDisable, placeholder } = useReceiverSelectLogic(users, groups, selectedOrgId);
	const receiverFilterOptions = React.useMemo(() => [
		{
			value: '',
			label: translate('nikki.authorize.grant_request.fields.org_all'),
		},
		...orgs.map((org) => ({
			value: org.id,
			label: org.displayName,
		})),
	], [orgs, translate]);

	return (
		<Paper p='md' withBorder>
			<Title order={5} mb='md'>
				{translate('nikki.authorize.grant_request.fields.receiver')}
			</Title>
			<Stack gap='xs'>
				{isCreate && (
					<Select
						label={translate('nikki.authorize.grant_request.fields.org')}
						data={receiverFilterOptions}
						placeholder='Select receiver scope'
						value={selectedOrgId === undefined ? null : (selectedOrgId ?? '')}
						onChange={(value) => {
							if (value === null) {
								onOrgIdChange?.(undefined);
								return;
							}
							onOrgIdChange?.(value === '' ? null : value);
						}}
						clearable
					/>
				)}
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
					// <EntitySelectField
					// 	fieldName='orgId'
					// 	entities={orgs}
					// 	getEntityId={(o) => o.id}
					// 	getEntityName={(o) => o.displayName}
					// 	prependOptions={globalOption}
					// />
					<></>
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
	selectedOrgId?: string | null;
	onOrgIdChange?: (orgId: string | null | undefined) => void;
	selectedReceiverOrgId?: string | null;
	onReceiverOrgIdChange?: (orgId: string | null | undefined) => void;
}

export const GrantRequestFormFields: React.FC<GrantRequestFormFieldsProps> = ({
	isCreate,
	roles,
	roleSuites,
	users,
	groups,
	orgs,
	selectedOrgId,
	onOrgIdChange,
	selectedReceiverOrgId,
	onReceiverOrgIdChange,
}) =>  {
	return (
		<Stack gap='md'>
			<TargetFields
				isCreate={isCreate}
				roles={roles}
				roleSuites={roleSuites}
				orgs={orgs}
				selectedOrgId={selectedOrgId}
				onOrgIdChange={onOrgIdChange}
			/>
			<ReceiverFields
				isCreate={isCreate}
				users={users}
				groups={groups}
				orgs={orgs}
				selectedOrgId={selectedReceiverOrgId}
				onOrgIdChange={onReceiverOrgIdChange}
			/>
			<CommonFields isCreate={isCreate} orgs={orgs} />
		</Stack>
	);
};