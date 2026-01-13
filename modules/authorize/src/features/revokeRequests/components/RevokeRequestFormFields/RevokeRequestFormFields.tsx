import { Paper, Stack, Title } from '@mantine/core';
import { AutoField } from '@nikkierp/ui/components/form';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ReceiverSelectField } from '@/features/revokeRequests/components/ReceiverSelectField/ReceiverSelectField';
import { TargetSelectField } from '@/features/revokeRequests/components/TargetSelectField/TargetSelectField';

import type { Group } from '@/features/identities';
import type { User } from '@/features/identities';
import type { RoleSuite } from '@/features/roleSuites';
import type { Role } from '@/features/roles';


interface TargetFieldsProps {
	roles?: Role[];
	roleSuites?: RoleSuite[];
}

const TargetFields: React.FC<TargetFieldsProps> = ({ roles, roleSuites }) => {
	const { t: translate } = useTranslation();

	return (
		<Paper p='md' withBorder>
			<Title order={5} mb='md'>
				{translate('nikki.authorize.revoke_request.fields.target')}
			</Title>
			<Stack gap='xs'>
				<AutoField name='targetType' />
				<TargetSelectField roles={roles} roleSuites={roleSuites} />
			</Stack>
		</Paper>
	);
};

interface ReceiverFieldsProps {
	users?: User[];
	groups?: Group[];
}

const ReceiverFields: React.FC<ReceiverFieldsProps> = ({ users, groups }) => {
	const { t: translate } = useTranslation();

	return (
		<Paper p='md' withBorder>
			<Title order={5} mb='md'>
				{translate('nikki.authorize.revoke_request.fields.receiver')}
			</Title>
			<Stack gap='xs'>
				<AutoField name='receiverType' />
				<ReceiverSelectField users={users} groups={groups} />
			</Stack>
		</Paper>
	);
};

interface CommonFieldsProps {
	isCreate?: boolean;
}

const CommonFields: React.FC<CommonFieldsProps> = ({ isCreate = false }) => {
	const { t: translate } = useTranslation();

	return (
		<Paper p='md' withBorder>
			<Title order={5} mb='md'>
				{translate('nikki.authorize.revoke_request.fields.other_info')}
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
			</Stack>
		</Paper>
	);
};

interface RevokeRequestFormFieldsProps {
	roles?: Role[];
	roleSuites?: RoleSuite[];
	users?: User[];
	groups?: Group[];
	isCreate?: boolean;
}

export const RevokeRequestFormFields: React.FC<RevokeRequestFormFieldsProps> = ({
	roles,
	roleSuites,
	users,
	groups,
	isCreate = false,
}) => {
	const { t: translate } = useTranslation();

	return (
		<Stack gap='md'>
			{isCreate ? (
				<>
					<TargetFields roles={roles} roleSuites={roleSuites} />
					<ReceiverFields users={users} groups={groups} />
				</>
			) : (
				<>
					<Paper p='md' withBorder>
						<Title order={5} mb='md'>
							{translate('nikki.authorize.revoke_request.fields.target')}
						</Title>
						<Stack gap='xs'>
							<AutoField
								name='targetType'
								htmlProps={{ readOnly: true }}
							/>
							<AutoField
								name='targetName'
								htmlProps={{ readOnly: true }}
							/>
						</Stack>
					</Paper>
					<Paper p='md' withBorder>
						<Title order={5} mb='md'>
							{translate('nikki.authorize.revoke_request.fields.receiver')}
						</Title>
						<Stack gap='xs'>
							<AutoField
								name='receiverType'
								htmlProps={{ readOnly: true }}
							/>
							<AutoField
								name='receiverName'
								htmlProps={{ readOnly: true }}
							/>
						</Stack>
					</Paper>
				</>
			)}
			<CommonFields isCreate={isCreate} />
		</Stack>
	);
};

