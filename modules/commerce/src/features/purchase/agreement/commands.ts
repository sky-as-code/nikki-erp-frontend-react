import { Command, ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { AgreementActionRequest, agreementService, ReasonedAgreementRequest } from './agreementService';
import { AGREEMENT_SCHEMA_NAME, PURCHASE_MODULE } from '../../constants';


const PREFIX = `${PURCHASE_MODULE}.${AGREEMENT_SCHEMA_NAME}`;

/**
 * Command names for the agreement resource.
 *
 * The CRUD names come from the schema-driven generic path (`core.resource.purchase_agreement.*`),
 * served by the Shell's single prefix subscription — this module subscribes none of them.
 *
 * The four below are genuinely not CRUD, and each carries its own permission on the backend.
 */
export const AgreementCommands = Object.freeze({
	...resourceCommands(AGREEMENT_SCHEMA_NAME),
	CONFIRM: `${PREFIX}.confirm`,
	CLOSE: `${PREFIX}.close`,
	CANCEL: `${PREFIX}.cancel`,
	CREATE_RFQ: `${PREFIX}.create_rfq`,
} as const);

/**
 * Registers the agreement service and subscribes its four lifecycle handlers. Called synchronously
 * during the micro-app `init` so lazy command resolution finds them.
 * Returns a function that unsubscribes every handler (for teardown).
 */
export function registerAgreementCommands(bus: ICommandBus): () => void {
	registerSchemaModule(AGREEMENT_SCHEMA_NAME, PURCHASE_MODULE);
	registerCrudService(AGREEMENT_SCHEMA_NAME, agreementService);

	const unsubscribers = [
		bus.subscribe(
			AgreementCommands.CONFIRM,
			cmd => agreementService.confirm(actionRequest(cmd)),
		),
		bus.subscribe(
			AgreementCommands.CLOSE,
			cmd => agreementService.close(actionRequest(cmd)),
		),
		bus.subscribe(
			AgreementCommands.CANCEL,
			cmd => agreementService.cancel(reasonedRequest(cmd)),
		),
		bus.subscribe(
			AgreementCommands.CREATE_RFQ,
			cmd => agreementService.createRfq(actionRequest(cmd)),
		),
	];

	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

/** The `{id, etag}` a contextual action publishes for the record it fired on. */
function actionRequest(command: Command): AgreementActionRequest {
	const payload = command.payload as Record<string, unknown>;
	return {
		id: String(payload.id ?? ''),
		etag: payload.etag == null ? undefined : String(payload.etag),
	};
}

/** Cancel, whose reason the backend reads and records on the audit event. */
function reasonedRequest(command: Command): ReasonedAgreementRequest {
	const payload = command.payload as Record<string, unknown>;
	return {
		...actionRequest(command),
		reason: String(payload.reason ?? ''),
	};
}
