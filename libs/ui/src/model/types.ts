
export type ModelSchema = {
	name: string;
	fields: Record<string, FieldDefinition>;
	constraints?: FieldConstraint[];
};

export type FieldDefinition = {
    type: 'string' | 'email' | 'password' | 'date' | 'integer' | 'enum' | 'object' | 'array';
    label: string;
    description?: string;
    placeholder?: string;
    required?: {
        create?: boolean;
        update?: boolean;
    };
    hidden?: boolean;
    frontendOnly?: boolean;
    constraints?: FieldConstraint[];
    enum?: FieldEnumOption[];
    enumSrc?: FieldEnumSource;
};

export type FieldEnumOption = {
	value: string;
	label: string;
};

export type FieldEnumSource = {
	stateSource: string;
	key: string;
	label: string;
};

export type FieldConstraint = {
	type: string;
	message?: string;
	min?: number | string;
	max?: number | string;
	allowToday?: boolean;
	allowFuture?: boolean;
	allowPast?: boolean;
	fields?: string[];
	pattern?: string;
};
