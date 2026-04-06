import { Box } from '@mantine/core';
import { AutoField } from '@nikkierp/ui/components';
import React from 'react';

import classes from './KioskDeviceFormFields.module.css';


export type KioskDeviceFormFieldsMode = 'view' | 'create' | 'edit';

export interface KioskDeviceFormFieldsProps {
	mode: KioskDeviceFormFieldsMode;
}

export const KioskDeviceFormFields: React.FC<KioskDeviceFormFieldsProps> = ({ mode }) => {
	const isView = mode === 'view';
	const readonlyInput = isView ? { readOnly: true } : {};

	return (
		<>
			<Box className={classes.formField}>
				<AutoField name='name' autoFocused={mode === 'create'} htmlProps={readonlyInput} />
			</Box>

			<Box className={classes.formField}>
				<AutoField name='code' htmlProps={mode !== 'create' ? { readOnly: true } : {}} />
			</Box>

			<Box className={classes.formField}>
				<AutoField name='description' htmlProps={readonlyInput} />
			</Box>

			<Box className={classes.formField}>
				<AutoField name='status' htmlProps={readonlyInput} />
			</Box>

			<Box className={classes.formField}>
				<AutoField name='deviceType' htmlProps={readonlyInput} />
			</Box>
		</>
	);
};
