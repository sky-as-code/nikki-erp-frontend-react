import { EventBus } from '../eventBus';

import type { IEventBus } from '../eventBus';


/**
 * Published when any API call comes back with a 5xx status: a technical failure the user can do
 * nothing about but retry later. The Shell answers it with one general error notice, so callers
 * still catch the thrown error but no longer show a message of their own for it.
 */
export const SERVER_ERROR_TOPIC = 'shell:request:server_error';

/** Payload of {@link SERVER_ERROR_TOPIC}. */
export type ServerErrorEvent = {
	status: number,
	url: string,
};

export function isServerErrorStatus(status: number): boolean {
	return status >= 500;
}

/**
 * What the request layer throws for a 5xx. A caller that catches it shows no message of its own:
 * the Shell's general notice (see {@link SERVER_ERROR_TOPIC}) already told the user.
 */
export class ServerFailureError extends Error {
	public readonly status: number;

	public constructor(status: number, message: string) {
		super(message);
		this.name = 'ServerFailureError';
		this.status = status;
	}
}

/** Whether `error` is a 5xx the Shell has already announced; matched by name too, across bundle copies. */
export function isAnnouncedServerFailure(error: unknown): boolean {
	return error instanceof ServerFailureError || (error as { name?: unknown } | null)?.name === 'ServerFailureError';
}

export function announceServerError(
	response: Pick<Response, 'status' | 'url'>, bus: IEventBus | null | undefined = EventBus.instance,
): void {
	if (isServerErrorStatus(response.status)) {
		bus?.publish(SERVER_ERROR_TOPIC, { status: response.status, url: response.url } satisfies ServerErrorEvent);
	}
}
