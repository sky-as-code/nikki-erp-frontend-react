import { Box } from '@mantine/core';
import { AutoField } from '@nikkierp/ui/components';
import React from 'react';

import classes from './KioskSettingFormFields.module.css';


export type KioskSettingFormFieldsMode = 'view' | 'create' | 'edit';

export interface KioskSettingFormFieldsProps {
	mode: KioskSettingFormFieldsMode;
}

export const KioskSettingFormFields: React.FC<KioskSettingFormFieldsProps> = ({ mode }) => {
	const isView = mode === 'view';
	const readonlyInput = isView ? { readOnly: true } : {};

	return (
		<>
			<Box className={classes.kioskSettingFormField}>
				<AutoField name='name' autoFocused={mode === 'create'} htmlProps={readonlyInput} />
			</Box>

			<Box className={classes.kioskSettingFormField}>
				<AutoField name='code' />
			</Box>

			<Box className={classes.kioskSettingFormField}>
				<AutoField name='description' htmlProps={readonlyInput} />
			</Box>

			<Box className={classes.kioskSettingFormField}>
				<AutoField name='status' htmlProps={readonlyInput} />
			</Box>

			<Box className={classes.kioskSettingFormField}>
				<AutoField name='brand' htmlProps={readonlyInput} />
			</Box>
		</>
	);
};
