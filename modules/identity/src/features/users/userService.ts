// import * as request from '@nikkierp/common/request';

import { delay } from '@nikkierp/common/utils';

import { User } from './types';


export const userService = {
	async listUsers(): Promise<User[]> {
		// const response = await request.post<LoginResponse>('/login', {
		// 	json: credentials,
		// });
		await delay(2_000);
		return Promise.resolve(data);
	},
	async getUser(id: string): Promise<User | undefined> {
		await delay(2_000);
		return Promise.resolve(data.find((user) => user.id === id));
	},
};


const data: User[] = [
	{
		id: '550e8400-e29b-41d4-a716-446655440000',
		email: 'john.doe@example.com',
		dateOfBirth: '1990-05-15',
		dependantNum: 2,
		gender: 'male',
		nationality: 'US',
	},
	{
		id: '550e8400-e29b-41d4-a716-446655440001',
		email: 'jane.smith@example.com',
		dateOfBirth: '1985-08-22',
		dependantNum: 1,
		gender: 'female',
		nationality: 'UK',
	},
	{
		id: '550e8400-e29b-41d4-a716-446655440002',
		email: 'michael.johnson@example.com',
		dateOfBirth: '1992-12-03',
		dependantNum: 0,
		gender: 'male',
		nationality: 'CA',
	},
	{
		id: '550e8400-e29b-41d4-a716-446655440003',
		email: 'sarah.williams@example.com',
		dateOfBirth: '1988-03-18',
		dependantNum: 3,
		gender: 'female',
		nationality: 'AU',
	},
	{
		id: '550e8400-e29b-41d4-a716-446655440004',
		email: 'david.brown@example.com',
		dateOfBirth: '1995-07-25',
		dependantNum: 1,
		gender: 'male',
		nationality: 'DE',
	},
	{
		id: '550e8400-e29b-41d4-a716-446655440005',
		email: 'emily.davis@example.com',
		dateOfBirth: '1991-11-09',
		dependantNum: 2,
		gender: 'female',
		nationality: 'FR',
	},
];