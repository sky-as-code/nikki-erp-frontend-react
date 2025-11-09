import {
	Box,
	Breadcrumbs,
	Button,
	Group,
	Stack,
	TagsInput,
	Typography,
} from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import {
	FormStyleProvider, FormFieldProvider, AutoField,
} from '@nikkierp/ui/components/form';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { FieldConstraint, FieldDefinition } from '@nikkierp/ui/model';
import { IconArchive, IconPlus, IconRefresh, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { Link, useParams } from 'react-router';


import { IdentityDispatch, userActions } from '../../appState';
import { selectUserState } from '../../appState/user';
import { UserState } from '../../features/users/userSlice';
import userSchema from '../../user-schema.json';


type UserSchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

export const UserDetailPageBody: React.FC = () => {
	const { userId } = useParams();
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const { userDetail, isLoadingDetail }: UserState = useMicroAppSelector(selectUserState);
	console.log({ userDetail });
	const schema = userSchema as UserSchema;

	React.useEffect(() => {
		dispatch(userActions.getUser(userId!));
	}, [userId, dispatch]);

	const onSubmit = (data: any) => {
		console.log('Form submitted:', data);
	};

	return (
		<Stack gap='md'>
			<Group>
				<Breadcrumbs style={{
					minWidth: '30%',
				}}>
					<Typography>
						<h4><Link to='../users'>Users</Link></h4>
					</Typography>
					<Typography>
						<h5>{userDetail?.email}</h5>
					</Typography>
				</Breadcrumbs>
			</Group>
			<Group>
				<Button leftSection={<IconPlus size={16} />} size='compact-md'>Create</Button>
				<Button leftSection={<IconRefresh size={16} />} size='compact-md' variant='outline' disabled={isLoadingDetail}>Refresh</Button>
				<Button leftSection={<IconTrash size={16} />} size='compact-md' variant='outline' disabled={isLoadingDetail}>Delete</Button>
				<Button leftSection={<IconArchive size={16} />} size='compact-md' variant='outline' disabled={isLoadingDetail}>Archive</Button>
			</Group>
			<FormStyleProvider layout='onecol'>
				{/* <FormFieldProvider
				formVariant='update' modelSchema={schema} modelValue={userDetail} modelLoading={isLoadingDetail}
			> */}
				<FormFieldProvider
					formVariant='create' modelSchema={schema}
				>
					{({ handleSubmit }) => (
						<Box p='md'>
							<form onSubmit={handleSubmit(onSubmit)} noValidate>
								<Stack gap='xs'>
									<AutoField name='id' />
									<AutoField name='email' autoFocused inputProps={{
										size: 'lg',
										disabled: true,
									}} />
									<AutoField name='password' />
									<AutoField name='passwordConfirm' />
									<AutoField name='dateOfBirth' />
									<AutoField name='dependantNum' htmlProps={{
										readOnly: true,
									}} />
									<AutoField name='gender' />
									<AutoField name='nationality' />
									<Button type='submit' mt='xl'>
										Submit
									</Button>
								</Stack>
							</form>
						</Box>
					)}
				</FormFieldProvider>
			</FormStyleProvider>
		</Stack>
	);
};

export const UserDetailPage: React.FC = withWindowTitle('User Detail', UserDetailPageBody);
