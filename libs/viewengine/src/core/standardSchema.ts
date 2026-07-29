/**
 * Minimal inline copy of the Standard Schema v1 contract.
 *
 * Templates declare their props validator as a `StandardSchemaV1`, not as a
 * concrete `zod.ZodType`. That keeps this package free of any runtime
 * validation dependency and lets a 3rd-party kit ship valibot / arktype /
 * anything else that implements `~standard`. Zod 4 implements it natively, so
 * first-party kits keep using zod with no adapter.
 *
 * The types are inlined rather than taken from `@standard-schema/spec` so the
 * core keeps a genuinely empty `dependencies` block.
 */
export interface StandardSchemaV1<TInput = unknown, TOutput = TInput> {
	readonly '~standard': StandardSchemaV1Props<TInput, TOutput>;
}

export interface StandardSchemaV1Props<TInput = unknown, TOutput = TInput> {
	readonly version: 1;
	readonly vendor: string;
	readonly validate: (
		value: unknown,
	) => StandardSchemaV1Result<TOutput> | Promise<StandardSchemaV1Result<TOutput>>;
	readonly types?: { readonly input: TInput, readonly output: TOutput } | undefined;
}

export type StandardSchemaV1Result<TOutput> =
	| StandardSchemaV1SuccessResult<TOutput>
	| StandardSchemaV1FailureResult;

export interface StandardSchemaV1SuccessResult<TOutput> {
	readonly value: TOutput;
	readonly issues?: undefined;
}

export interface StandardSchemaV1FailureResult {
	readonly issues: readonly StandardSchemaV1Issue[];
}

export interface StandardSchemaV1Issue {
	readonly message: string;
	readonly path?: readonly (PropertyKey | { readonly key: PropertyKey })[] | undefined;
}

/** Convenience alias for the value a schema produces. */
export type InferOutput<TSchema extends StandardSchemaV1> =
	NonNullable<TSchema['~standard']['types']>['output'];
