import { z, ZodNumber, ZodString } from 'zod';

import { extractLabel } from './formContext';
import { FieldDefinition, FieldConstraint, ModelSchema } from '../../model';


export function createBaseSchema(fieldDef: FieldDefinition): z.ZodTypeAny {
	switch (fieldDef.type) {
		case 'email':
			return z.string().email();
		case 'password':
			return z.string();
		case 'integer':
			return z.number().int();
		case 'date':
			return z.date().or(z.string().transform((str) => new Date(str)));
		case 'enum':
			if (fieldDef.enum) {
				const enumValues = fieldDef.enum.map((opt) => opt.value) as [string, ...string[]];
				// Always make enum optional initially to accept undefined
				// Required constraint will handle validation with custom message
				return z.enum(enumValues).optional();
			}

			return z.string();
		case 'array':
			// Handle array type - allow it to pass through without strict validation
			return z.array(z.any()).optional();
		case 'object':
			// Handle object type - allow it to pass through without validation
			return z.any().optional();
		default:
			return z.string();
	}
}

// Apply length constraint to string schema
function applyLengthConstraint(schema: ZodString, constraint: FieldConstraint, message?: string): ZodString {
	const minValue = typeof constraint.min === 'number' ? constraint.min : undefined;
	const maxValue = typeof constraint.max === 'number' ? constraint.max : undefined;
	let stringSchema = schema;

	if (minValue !== undefined) {
		stringSchema = stringSchema.min(minValue, {
			message: message || `Minimum length is ${minValue}`,
		});
	}

	if (maxValue !== undefined) {
		stringSchema = stringSchema.max(maxValue, {
			message: message || `Maximum length is ${maxValue}`,
		});
	}

	return stringSchema;
}

// Apply value range constraint to number schema
function applyValueRangeConstraint(
	schema: ZodNumber,
	constraint: FieldConstraint,
	message?: string,
): ZodNumber {
	const minValue = typeof constraint.min === 'number' ? constraint.min : undefined;
	const maxValue = typeof constraint.max === 'number' ? constraint.max : undefined;
	let numberSchema = schema;

	if (minValue !== undefined) {
		numberSchema = numberSchema.min(minValue, {
			message: message || `Minimum value is ${minValue}`,
		});
	}

	if (maxValue !== undefined) {
		numberSchema = numberSchema.max(maxValue, {
			message: message || `Maximum value is ${maxValue}`,
		});
	}

	return numberSchema;
}

// Apply date range constraint
function applyDateRangeConstraint(
	schema: z.ZodTypeAny,
	constraint: FieldConstraint,
	message?: string,
): z.ZodTypeAny {
	const minDate = constraint.min ? new Date(constraint.min as string) : undefined;
	const maxDate = constraint.max ? new Date(constraint.max as string) : undefined;

	return schema.refine(
		(value: unknown) => {
			const date = value instanceof Date ? value : new Date(value as string);
			if (minDate && date < minDate) {
				return false;
			}

			if (maxDate && date > maxDate) {
				return false;
			}

			if (
				constraint.allowToday === false &&
				date.toDateString() === new Date().toDateString()
			) {
				return false;
			}

			if (constraint.allowFuture === false && date > new Date()) {
				return false;
			}

			if (constraint.allowPast === false && date < new Date()) {
				return false;
			}

			return true;
		},
		{ message: message || 'Date is out of range' },
	);
}

// Apply a single constraint to a schema
function applyConstraint(
	fieldSchema: z.ZodTypeAny,
	constraint: FieldConstraint,
): z.ZodTypeAny {
	const message = constraint.message
		? extractLabel(constraint.message)
		: undefined;

	switch (constraint.type) {
		case 'required':
			if (fieldSchema instanceof ZodString) {
				// Check if schema is optional (might be used with Select)
				// If optional, use refine to handle undefined/null/empty string
				if (fieldSchema.isOptional()) {
					return fieldSchema.refine(
						(val) => val !== undefined && val !== null && val !== '',
						{ message: message || 'Required' },
					);
				}
				// Otherwise use min(1) for non-optional strings
				return fieldSchema.min(1, { message: message || 'Required' });
			}
			// For enum (which is optional), use refine to check if value exists
			return fieldSchema.refine(
				(val) => val !== undefined && val !== null && val !== '',
				{ message: message || 'Required' },
			);
		case 'length':
			if (fieldSchema instanceof ZodString) {
				return applyLengthConstraint(fieldSchema, constraint, message);
			}

			return fieldSchema;
		case 'value_range':
			if (fieldSchema instanceof ZodNumber) {
				return applyValueRangeConstraint(fieldSchema, constraint, message);
			}

			return fieldSchema;
		case 'date_range':
			return applyDateRangeConstraint(fieldSchema, constraint, message);
		case 'regex':
			if (fieldSchema instanceof ZodString && constraint.pattern) {
				try {
					const regex = new RegExp(constraint.pattern);
					return fieldSchema.regex(regex, { message: message || 'Invalid format' });
				}
				catch {
					return fieldSchema;
				}
			}
			return fieldSchema;
		default:
			return fieldSchema;
	}
}

// Build Zod schema for a single field
export function buildFieldSchema(fieldDef: FieldDefinition): z.ZodTypeAny {
	let fieldSchema = createBaseSchema(fieldDef);

	// Check if field has required constraint (might be used with Select component)
	const hasRequiredConstraint = fieldDef.constraints?.some((c) => c.type === 'required');
	const isRequired = fieldDef.required?.create || fieldDef.required?.update;

	// For string fields with required constraint, make optional initially
	// (similar to enum) so they can accept undefined from Select components
	// The required constraint will handle validation with refine
	if (fieldDef.type === 'string' && hasRequiredConstraint) {
		fieldSchema = fieldSchema.optional();
	}

	// Apply constraints
	if (fieldDef.constraints) {
		fieldDef.constraints.forEach((constraint) => {
			fieldSchema = applyConstraint(fieldSchema, constraint);
		});
	}

	// Make optional if not required (enum is already optional from createBaseSchema)
	// Only apply .optional() to non-enum fields that are not required and don't have required constraint
	if (fieldDef.type !== 'enum' && !isRequired && !hasRequiredConstraint) {
		fieldSchema = fieldSchema.optional();
	}

	return fieldSchema;
}

export function buildValidationSchema(schema: ModelSchema): z.ZodObject<any> {
	const shape: Record<string, z.ZodTypeAny> = {};

	Object.entries(schema.fields).forEach(([fieldName, fieldDef]) => {
		// Skip frontend-only fields in validation if needed, or hidden fields
		if (fieldDef.hidden && !fieldDef.frontendOnly) {
			return;
		}

		let fieldSchema = buildFieldSchema(fieldDef);

		// For frontendOnly fields that are not required in update mode, make them optional
		// to allow undefined values from backend
		if (fieldDef.frontendOnly && !fieldDef.required?.update) {
			fieldSchema = fieldSchema.optional();
		}

		shape[fieldName] = fieldSchema;
	});

	const baseSchema = z.object(shape);

	// Add password confirmation validation if both password and confirmPassword fields exist
	if (shape.password && shape.confirmPassword) {
		return baseSchema.refine(
			(data) => {
				// Only validate if both fields have values
				if (!data.password && !data.confirmPassword) {
					return true;
				}
				return data.password === data.confirmPassword;
			},
			{
				message: 'Passwords do not match',
				path: ['confirmPassword'], // Show error on confirmPassword field
			},
		);
	}

	return baseSchema;
}