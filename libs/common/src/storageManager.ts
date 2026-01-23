// import { Organization, User } from '../types';

const AUTH_KEY = 'nikki_auth';

export type AuthData = {
	token: string;
	// user?: User;
	// orgs?: Organization[];
};

export function setAuthData(authData: AuthData): void {
	localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
}

export function getAuthData(): AuthData | null {
	const authData = localStorage.getItem(AUTH_KEY);
	if (!authData) return null;

	try {
		return JSON.parse(authData) as AuthData;
	}
	catch {
		console.warn('Malformed auth data');
		return null;
	}
}

export function getAuthToken(): string | null {
	const authData = getAuthData();
	return authData?.token ?? null;
}

export function clearAuthData(): void {
	localStorage.removeItem(AUTH_KEY);
}

const storageManager = {
	setAuthData,
	getAuthData,
	getAuthToken,
	clearAuthData,
};

export default storageManager;