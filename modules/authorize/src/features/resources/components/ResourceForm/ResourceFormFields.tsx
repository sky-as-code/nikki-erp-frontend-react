import { AutoField } from '@nikkierp/ui/components/form';
import React from 'react';


export const ResourceFormFields: React.FC<{ isCreate: boolean }> = ({ isCreate }) => (
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
		<AutoField
			name='resourceType'
			inputProps={{
				disabled: !isCreate,
			}}
			htmlProps={!isCreate ? {
				readOnly: true,
			} : undefined}
		/>
		<AutoField
			name='resourceRef'
			inputProps={{
				disabled: !isCreate,
			}}
			htmlProps={!isCreate ? {
				readOnly: true,
			} : undefined}
		/>
		<AutoField
			name='scopeType'
			inputProps={{
				disabled: !isCreate,
			}}
			htmlProps={!isCreate ? {
				readOnly: true,
			} : undefined}
		/>
	</>
);

