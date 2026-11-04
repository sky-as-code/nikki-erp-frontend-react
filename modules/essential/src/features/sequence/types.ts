/**
 * The configuration fields `preview` renders, as a definition record carries them. `algorithm` is the API's
 * spelling (`increment` | `pseudorandom`); `algorithm_params` never leaves the server and is never sent.
 */
export const SEQUENCE_PREVIEW_FIELDS = [
	'format_owner', 'algorithm', 'prefix_template', 'suffix_template', 'padding', 'increment', 'initial_value',
	'reset_period', 'timezone',
] as const;

export type SequencePreviewRequest = Partial<Record<(typeof SEQUENCE_PREVIEW_FIELDS)[number], unknown>> & {
	/** The number to render; the definition's `initial_value` when absent or lower. */
	sample_number?: string,
	/** RFC 3339 time the periods and date placeholders are taken from; now when absent. */
	sample_at?: string,
};

/** What `POST …/essential_sequence_definition/preview` answers. Nothing is reserved. */
export type SequencePreview = {
	formatted_value: string,
	period_key: string,
	/** A decimal string: an int64 does not survive a JavaScript number. */
	sample_number: string,
	sample_at: string,
	is_illustration: boolean,
};
