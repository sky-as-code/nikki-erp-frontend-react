import type { SessionTokens } from '../../common/session/cookies';


/** What an IAM endpoint answers, independent of Express, so services stay testable without HTTP. */
export interface IamResult {
	readonly status: number;
	/** Serialized as JSON; a string is sent as-is with `contentType`; undefined sends no body. */
	readonly body?: unknown;
	readonly contentType?: string;
	/** `clear` deletes both session cookies; tokens rotate them. */
	readonly session?: SessionTokens | 'clear';
}

export function isSuccess(status: number): boolean {
	return status >= 200 && status < 300;
}

export function upstreamResult(status: number, body: unknown, contentType: string | undefined): IamResult {
	return { status, body, contentType };
}
