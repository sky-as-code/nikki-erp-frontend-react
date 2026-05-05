import type { ModelSchema } from '@nikkierp/common/dynamic_model';


export const emailSchema: ModelSchema = {
	name: 'login-email',
	fields: {
		email: {
			name: 'email',
			label: { 'en-US': 'nikki.identity.user.fields.email' },
			placeholder: { 'en-US': 'nikki.shell.signIn.enterEmail' },
			data_type: {
				name: 'email',
				options: { length: [10, 255] },
			},
			is_required_for_create: true,
			is_required_for_update: true,
		},
	},
};
