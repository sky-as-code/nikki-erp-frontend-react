import type { StandardSchemaV1, StandardSchemaV1Result } from '../core/standardSchema';


/**
 * Runs a Standard Schema validator synchronously. Page and component props must
 * validate during render, so an async validator is a programming error rather
 * than a runtime condition to tolerate.
 */
export function validateProps<TOutput>(
	schema: StandardSchemaV1<unknown, TOutput>,
	input: unknown,
	contributionId: string,
): StandardSchemaV1Result<TOutput> {
	const result = schema['~standard'].validate(input);
	if (result instanceof Promise) {
		throw new Error(`Props schema for "${contributionId}" must be synchronous.`);
	}
	return result;
}
