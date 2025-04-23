import type { AuthData } from '@modules/core/auth/storageManager';

import { post } from '@/common/request';
import { ApiResult } from '@/types/common';


export type LoginUserResult = {
	token: string;
	user: {
		id: string;
		email: string;
		name: string;
		avatar?: string;
	};
	orgs: Organization[];
};

type Organization = {
	id: string;
	name: string;
	slug: string;
};

export async function loginUser(credentials: { email: string; password: string }): Promise<ApiResult<LoginUserResult>> {
	return {
		data: {
			token: 'test',
			user: {
				id: 'test',
				email: 'test',
				name: 'test',
			},
		},
	} as ApiResult<LoginUserResult>;

	// let response: ApiResult<LoginUserResult> = {};
	// try {
	// 	response = await post<ApiResult<LoginUserResult>>('/auth/login', {
	// 		json: credentials,
	// 	});
	// }
	// catch (error) {
	// 	response.errors = Array(String(error));
	// }

	// return response;
}
