import { Box } from '@mantine/core';
import { AutoField } from '@nikkierp/ui/components';
import React from 'react';

import classes from './KioskModelFormFields.module.css';


export type KioskModelFormFieldsMode = 'view' | 'create' | 'edit';

export interface KioskModelFormFieldsProps {
	mode: KioskModelFormFieldsMode;
}

export const KioskModelFormFields: React.FC<KioskModelFormFieldsProps> = ({ mode }) => {
	const isView = mode === 'view';
	const readonlyInput = isView ? { readOnly: true } : {};

	return (
		<>
			<Box className={classes.formField}>
				<AutoField name='name' autoFocused={mode === 'create'} htmlProps={readonlyInput} />
			</Box>

			<Box className={classes.formField}>
				<AutoField name='modelId' htmlProps={mode !== 'create' ? { readOnly: true } : {}} />
			</Box>

			<Box className={classes.formField}>
				<AutoField name='referenceCode' htmlProps={mode !== 'create' ? { readOnly: true } : {}} />
			</Box>

			<Box className={classes.formField}>
				<AutoField name='description' htmlProps={readonlyInput} />
			</Box>

			<Box className={classes.formField}>
				<AutoField name='status' htmlProps={readonlyInput} />
			</Box>

			{mode === 'create' && (
				<Box className={classes.formField}>
					<AutoField name='goodsCollectorType' />
				</Box>
			)}
			{mode === 'create' && (
				<Box className={classes.formField}>
					<AutoField name='shelvesNumber' />
				</Box>
			)}
		</>
	);
};
