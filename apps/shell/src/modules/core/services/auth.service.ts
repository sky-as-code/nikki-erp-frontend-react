import { Organization, User } from '../types'

import { post } from '@/common/request'
import { ApiResult } from '@/common/types/common'

export type LoginUserResult = {
	token: string;
	user?: User;
	orgs?: Organization[];
}

export async function loginUser(credentials: {
	email: string;
	password: string;
}): Promise<ApiResult<LoginUserResult>> {

	return {
		data: {
			token: 'test',
			user: {
				id: 'test',
				email: 'test',
				name: 'test',
			},
		},
	} as ApiResult<LoginUserResult>
}

export async function logoutUser(): Promise<ApiResult<void>> {
	return {
		data: undefined,
	} as ApiResult<void>
}


export async function createLoginAttempt({ email } : { email: string }): Promise<ApiResult<{ attemptId: string }>> {

	const _result = await post<{ error: string, attemptId: string }>('auth/login-attempt', { json: { email } }).then(res => {
		return res
	}).catch(err => {
		return err
	})

	return {
		data: {
			attemptId: 'attemptId',
		},
	} as ApiResult<{ attemptId: string }>
}
