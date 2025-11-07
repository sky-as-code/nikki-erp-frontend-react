import { ISignInStrategy } from './types';


/**
 * This strategy invokes NikkiERP Authenticate Module.
 */
export class NikkiAuthenticateStrategy implements ISignInStrategy {
	public get tokenType(): string {
		return 'Bearer';
	}

	public init(): void {
		console.log('NikkiAuthenticateStrategy init');
	}

	public getAccessToken(): string {
		throw new Error('Method not implemented.');
	}
}
