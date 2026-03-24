import React from 'react';

import { AutoField } from '@nikkierp/ui/components';


export interface KioskModelFormFieldsProps {
	isCreate: boolean;
}

export const KioskModelFormFields: React.FC<KioskModelFormFieldsProps> = () => {
	return (
		<>
			<AutoField name='name' autoFocused />
			<AutoField name='code' />
			<AutoField name='description' />
			<AutoField name='status' />
			<AutoField name='kioskType' />
		</>
	);
};
