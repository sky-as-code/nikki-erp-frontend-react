import { Paper, Stack, Title } from '@mantine/core';
import { AutoField } from '@nikkierp/ui/components/form';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ReceiverSelectField } from '../ReceiverSelectField/ReceiverSelectField';
import { TargetSelectField } from '../TargetSelectField/TargetSelectField';

import type { Group } from '@/features/identities';
import type { User } from '@/features/identities';
import type { RoleSuite } from '@/features/role_suites';
import type { Role } from '@/features/roles';


interface TargetFieldsProps {
	isCreate: boolean;
	roles?: Role[];
	roleSuites?: RoleSuite[];
}

const TargetFields: React.FC<TargetFieldsProps> = ({ isCreate, roles, roleSuites }) => {
	const { t: translate } = useTranslation();

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
					<TargetSelectField roles={roles} roleSuites={roleSuites} />
				) : (
					<AutoField
						name='targetName'
						htmlProps={{ readOnly: true }}
					/>
				)}
			</Stack>
		</Paper>
	);
};

interface ReceiverFieldsProps {
	isCreate: boolean;
	users?: User[];
	groups?: Group[];
}

const ReceiverFields: React.FC<ReceiverFieldsProps> = ({ isCreate, users, groups }) => {
	const { t: translate } = useTranslation();

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
					<ReceiverSelectField users={users} groups={groups} />
				) : (
					<AutoField
						name='receiverName'
						htmlProps={{ readOnly: true }}
					/>
				)}
			</Stack>
		</Paper>
	);
};

interface CommonFieldsProps {
	isCreate: boolean;
}

const CommonFields: React.FC<CommonFieldsProps> = ({ isCreate }) => {
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
				<AutoField
					name='orgId'
					htmlProps={!isCreate ? { readOnly: true } : undefined}
				/>
				{!isCreate && (
					<AutoField name='status' htmlProps={{ readOnly: true }} />
				)}
			</Stack>
		</Paper>
	);
};

interface GrantRequestFormFieldsProps {
	isCreate: boolean;
	roles?: Role[];
	roleSuites?: RoleSuite[];
	users?: User[];
	groups?: Group[];
}

export const GrantRequestFormFields: React.FC<GrantRequestFormFieldsProps> = ({
	isCreate,
	roles,
	roleSuites,
	users,
	groups,
}) => (
	<Stack gap='md'>
		<TargetFields isCreate={isCreate} roles={roles} roleSuites={roleSuites} />
		<ReceiverFields isCreate={isCreate} users={users} groups={groups} />
		<CommonFields isCreate={isCreate} />
	</Stack>
);

