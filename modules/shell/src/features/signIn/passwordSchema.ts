import type { ModelSchema } from '@nikkierp/common/dynamic_model';


export const passwordSchema: ModelSchema = {
	name: 'login-password',
	fields: {
		password: {
			name: 'password',
			label: { 'en-US': 'nikki.identity.user.fields.password' },
			placeholder: { 'en-US': 'nikki.shell.signIn.enterPassword' },
			data_type: {
				name: 'secret',
				options: { length: [10, 255] },
			},
			is_required_for_create: true,
			is_required_for_update: true,
		},
	},
};
