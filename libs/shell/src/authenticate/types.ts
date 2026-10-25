export const SLICE_NAME = 'shell.authenticate';

export interface ISignInStrategy {
	// Commence the sign in process. Each strategy implementation can have its own request and response definitions.
	startSignIn(params: StartSignInParams): Promise<StartSignInResult>;
	continueSignIn(params: SignInParams): Promise<SignInResult>;
	/** Rotates the session cookies; the refresh cookie travels on its own, so there is nothing to send. */
	refreshSession(): Promise<AuthenticatedSession>;
	signOut(): Promise<void>;
}

/** What the BFF tells the browser about a session: only when its cookies lapse, never the tokens. */
export type AuthenticatedSession = {
	accessTokenExpiresAt: string,
	refreshTokenExpiresAt: string,
};

export type SignInResult = {
	done: boolean,
	data?: AuthenticatedSession,
	nextStep?: string,
};

export type StartSignInParams = {
	principalType?: string,
	username: string,
};

export type StartSignInResult = {
	attemptId: string,
	createdAt: string,
	currentMethod: string,
	expiresAt: string,
	methods: string[],
	principalName: string,
};

export type SignInParams = {
	attemptId: string,
	passwords: Record<string, unknown>,
};

/** Epoch milliseconds. Not secret: the cookies they describe are httpOnly. */
export type SessionExpiry = {
	accessExpiresAt: number,
	refreshExpiresAt: number,
};

export interface ISessionStorage {
	get(): SessionExpiry | null;
	set(expiry: SessionExpiry): void;
	clear(): void;
}
