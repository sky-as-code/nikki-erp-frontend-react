import { Box } from '@mantine/core';
import { AutoField } from '@nikkierp/ui/components';
import React from 'react';

import classes from './PaymentDetailFormFields.module.css';


export type PaymentDetailFormFieldsMode = 'view' | 'edit' | 'create';

export interface PaymentDetailFormFieldsProps {
	mode: PaymentDetailFormFieldsMode;
}

export const PaymentDetailFormFields: React.FC<PaymentDetailFormFieldsProps> = ({ mode }) => {
	const isView = mode === 'view';
	const readonlyInput = isView ? { readOnly: true } : {};

	return (
		<>
			<Box className={classes.formField}>
				<AutoField name='method' autoFocused={mode === 'create'} htmlProps={mode !== 'create' ? { readOnly: true } : {}} />
			</Box>
			<Box className={classes.formField}>
				<AutoField name='name' htmlProps={readonlyInput} />
			</Box>
			<Box className={classes.formField}>
				<AutoField name='image' htmlProps={readonlyInput} />
			</Box>
		</>
	);
};
