import { AutoField } from '@nikkierp/ui/components/form';
import React from 'react';

import { OrgSelectField, OrgDisplayField } from '../orgSelectField';

import type { Org } from '@/features/orgs';


interface RoleSuiteFormFieldsProps {
	isCreate: boolean;
	orgs?: Org[];
	onOrgIdChange?: (orgId: string | undefined) => void;
}

export const RoleSuiteFormFields: React.FC<RoleSuiteFormFieldsProps> = ({
	isCreate,
	orgs,
	onOrgIdChange,
}) => (
	<>
		{!isCreate && <AutoField name='id' />}
		<AutoField
			name='name'
			autoFocused
		/>
		<AutoField name='description' />
		<AutoField
			name='ownerType'
			inputProps={{
				disabled: !isCreate,
			}}
			htmlProps={!isCreate ? {
				readOnly: true,
			} : undefined}
		/>
		<AutoField
			name='ownerRef'
			inputProps={{
				disabled: !isCreate,
			}}
			htmlProps={!isCreate ? {
				readOnly: true,
			} : undefined}
		/>
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
		{isCreate ? (
			<OrgSelectField orgs={orgs} onOrgIdChange={onOrgIdChange} />
		) : (
			<OrgDisplayField orgs={orgs} />
		)}
	</>
);

