import { AutoField } from '@nikkierp/ui/components/form';
import React from 'react';

import { ActionDisplayField } from './ActionDisplayField';
import { ActionSelectField } from './ActionSelectField';
import { ResourceDisplayField } from './ResourceDisplayField';
import { ResourceSelectField } from './ResourceSelectField';

import type { Action } from '@/features/actions';
import type { Resource } from '@/features/resources';


interface EntitlementFormFieldsProps {
	isCreate: boolean;
	resources?: Resource[];
	actions?: Action[];
}

export const EntitlementFormFields: React.FC<EntitlementFormFieldsProps> = ({
	isCreate,
	resources,
	actions,
}) => (
	<>
		{!isCreate && <AutoField name='id' />}
		<AutoField
			name='name'
			autoFocused
			inputProps={{
				disabled: !isCreate,
			}}
			htmlProps={!isCreate ? {
				readOnly: true,
			} : undefined}
		/>
		<AutoField name='description' />
		{isCreate ? (
			<>
				<ResourceSelectField resources={resources} />
				<ActionSelectField actions={actions} />
			</>
		) : (
			<>
				<ResourceDisplayField resources={resources} />
				<ActionDisplayField actions={actions} />
			</>
		)}
	</>
);

