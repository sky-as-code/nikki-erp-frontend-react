import * as request from '@nikkierp/common/request';

import type { LoginCredentials, LoginResponse, User } from './authSlice';


export const authService = {
	async signIn(credentials: LoginCredentials): Promise<LoginResponse> {
		const response = await request.post<LoginResponse>('/login', {
			json: credentials,
		});
		return response;
	},

	async signOut(): Promise<void> {
		await request.post('/logout');
	},

	async refreshToken(refreshToken: string): Promise<{ token: string }> {
		const response = await request.post<{ token: string }>('/refresh-token', {
			json: { refreshToken },
		});
		return response;
	},

	async fetchProfile(): Promise<User> {
		const response = await request.get<User>('/profile');
		return response;
	},
};
