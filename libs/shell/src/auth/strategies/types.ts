export interface ISignInStrategy {
	readonly tokenType: string;
	init(): void;
	getAccessToken(): string;
}
