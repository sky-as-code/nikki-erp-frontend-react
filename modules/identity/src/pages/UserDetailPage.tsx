import { zodResolver } from '@hookform/resolvers/zod';
import {
	ActionIcon,
	Box,
	Button,
	Grid,
	Input,
	NumberInput,
	Select,
	Stack,
	Text,
} from '@mantine/core';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { DateInput } from '@mantine/dates';
import { useId } from '@mantine/hooks';
import React, { createContext, useContext, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z, ZodNumber, ZodString } from 'zod';

import {
	FieldDefinition, FieldConstraint, buildValidationSchema, FormStyleProvider, FormFieldProvider,
	AutoField,
} from '@nikkierp/ui/components/form';


import userSchema from '../user-schema.json';

type UserSchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

export const UserDetailPage: React.FC = () => {
	const schema = userSchema as UserSchema;
	const zodSchema = buildValidationSchema(schema);

	type FormData = z.infer<typeof zodSchema>;

	const form = useForm<FormData>({
		resolver: zodResolver(zodSchema),
		defaultValues: {},
	});

	const { register, control, handleSubmit, formState: { errors } } = form;

	const onSubmit = (data: FormData) => {
		console.log('Form submitted:', data);
	};

	return (
		<FormStyleProvider layout='twocol'>
			<FormFieldProvider pageVariant='create' schema={schema} register={register} control={control} errors={errors}>
				<Box p='md'>
					<form onSubmit={handleSubmit(onSubmit)} noValidate>
						<Stack gap='xs'>
							<AutoField name='id' />
							<AutoField name='email' />
							<AutoField name='password' />
							<AutoField name='passwordConfirm' />
							<AutoField name='dateOfBirth' />
							<AutoField name='dependantNum' />
							<AutoField name='gender' />
							<AutoField name='nationality' />
							<Button type='submit' mt='xl'>
								Submit
							</Button>
						</Stack>
					</form>
				</Box>
			</FormFieldProvider>
		</FormStyleProvider>
	);
};