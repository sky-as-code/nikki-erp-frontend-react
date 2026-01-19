import { AutoField } from '@nikkierp/ui/components/form';
import React from 'react';


export const ResourceFormFields: React.FC<{ isCreate: boolean }> = ({ isCreate }) => (
	<>
		{!isCreate && <AutoField name='id' />}
		<AutoField
			name='name'
			autoFocused
			htmlProps={!isCreate ? {
				readOnly: true,
			} : undefined}
		/>
		<AutoField name='description' />
		<AutoField
			name='resourceType'
			htmlProps={!isCreate ? {
				readOnly: true,
			} : undefined}
		/>
		<AutoField
			name='resourceRef'
			htmlProps={!isCreate ? {
				readOnly: true,
			} : undefined}
		/>
		<AutoField
			name='scopeType'
			htmlProps={!isCreate ? {
				readOnly: true,
			} : undefined}
		/>
	</>
);

