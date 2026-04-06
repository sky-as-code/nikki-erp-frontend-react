import { Box } from '@mantine/core';
import { AutoField } from '@nikkierp/ui/components';
import React from 'react';

import classes from './SettingFormFields.module.css';


export type SettingFormFieldsMode = 'view' | 'create' | 'edit';

export interface SettingFormFieldsProps {
	mode: SettingFormFieldsMode;
}

export const SettingFormFields: React.FC<SettingFormFieldsProps> = ({ mode }) => {
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
				<AutoField name='category' htmlProps={readonlyInput} />
			</Box>

			<Box className={classes.formField}>
				<AutoField name='value' htmlProps={readonlyInput} />
			</Box>

			<Box className={classes.formField}>
				<AutoField name='status' htmlProps={readonlyInput} />
			</Box>
		</>
	);
};
