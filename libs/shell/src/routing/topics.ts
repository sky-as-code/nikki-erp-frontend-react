/**
 * Shell-owned event topics.
 *
 * Every topic has **exactly three** colon-delimited parts. `matchesTopic` requires equal
 * part counts, so a 2- or 4-part topic would silently stop matching `shell:*:*` — keep
 * new topics at three parts.
 *
 * The bus has **no replay**: a module that subscribes after an event fired never sees it.
 * So every topic representing latched state must have a paired read command on the
 * command bus — events are for invalidation, commands are for value.
 */
export const SHELL_EVENTS = Object.freeze({
	/** A navigation was requested. Payload: {@link NavigateEventPayload}. */
	ROUTING_NAVIGATE: 'shell:routing:navigate',
	/** The active organization changed. Payload: `{ orgSlug, previousOrgSlug }`. */
	ROUTING_ACTIVE_ORG_CHANGED: 'shell:routing:active_org_changed',
	/** The active module changed. Payload: `{ moduleSlug, previousModuleSlug }`. */
	ROUTING_ACTIVE_MODULE_CHANGED: 'shell:routing:active_module_changed',

	/** No further attempt will be made to authenticate. Read: `shell.session.is_authenticated`. */
	SESSION_SETTLED: 'shell:session:settled',
	SESSION_SIGNED_IN: 'shell:session:signed_in',
	SESSION_SIGNED_OUT: 'shell:session:signed_out',

	/** The user context finished loading. Read: `shell.user_context.get`. */
	USER_CONTEXT_LOADED: 'shell:user_context:loaded',
} as const);

export type NavigateEventPayload = {
	to: string,
	hardNavigate: boolean,
};
