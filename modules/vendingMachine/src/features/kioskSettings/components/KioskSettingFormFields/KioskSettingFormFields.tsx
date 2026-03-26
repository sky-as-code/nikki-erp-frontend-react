import React from 'react';

import { AutoField } from '@nikkierp/ui/components';


export const KioskSettingFormFields: React.FC = () => (
	<>
		<AutoField name='code' autoFocused />
		<AutoField name='name' />
		<AutoField name='description' />
		<AutoField name='status' />
		<AutoField name='brand' />
	</>
);
