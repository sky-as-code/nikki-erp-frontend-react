import * as request from '@nikkierp/common/request';
import { User } from '@nikkierp/ui/auth';

import { ISignInStrategy } from './strategies';

import type { LoginCredentials, LoginResponse } from './authSlice';


export class AuthService {
	private _strategy?: ISignInStrategy;

	public get strategy(): ISignInStrategy | undefined {
		return this._strategy;
	}

	public set strategy(strategy: ISignInStrategy) {
		this._strategy = strategy;
	}

	public async signIn(credentials: LoginCredentials): Promise<LoginResponse> {
		const response = await request.post<LoginResponse>('/login', {
			json: credentials,
		});
		return response;
	}

	public async signOut(): Promise<void> {
		await request.post('/logout');
	}

	public async refreshToken(refreshToken: string): Promise<{ token: string }> {
		const response = await request.post<{ token: string }>('/refresh-token', {
			json: { refreshToken },
		});
		return response;
	}

	public async fetchProfile(): Promise<User> {
		const response = await request.get<User>('/profile');
		return response;
	}
}

export const authService = new AuthService();