/** Translation keys of the client-side validation messages, matching the server's error keys. */
export const ErrorKeys = {
	invalidDataType: 'err_invalid_data_type',
	missingRequiredField: 'err_missing_required_field',
	formatMismatch: 'err_format_mismatch',
	invalidEmail: 'err_invalid_email',
	invalidUrl: 'err_invalid_url',
	invalidStringPattern: 'err_invalid_string_pattern',
	invalidStringLength: 'err_invalid_string_length',
	invalidNumberRange: 'err_invalid_number_range',
	notOneOf: 'err_not_one_of',
	invalidArrayLength: 'err_invalid_array_length',
	invalidResourceCode: 'err_invalid_resource_code',
} as const;
