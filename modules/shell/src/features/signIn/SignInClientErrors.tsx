import { Stack, Text } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { useClientErrorTranslate } from '@nikkierp/ui/i18n';
import React from 'react';


/** The shape a service-layer result reports its client errors in. */
type SignInClientError = { key: string, message: string, field?: string };

/**
 * The business and validation errors a sign-in step got back from the server, translated, under
 * its input. A namespaced key (`iam:err_service_signin_forbidden`) resolves in its own namespace;
 * an unknown key falls back to the server's message.
 */
export function SignInClientErrors(
	{ errors, testId }: { errors: readonly SignInClientError[], testId: string },
): React.ReactNode {
	const translateError = useClientErrorTranslate(['iam', 'common']);
	if (errors.length === 0) {
		return null;
	}
	return (
		<Stack gap={4} role='alert' {...testAttrs(testId, 'clientErrors')}>
			{errors.map(item => (
				<Text key={`${item.field ?? ''}:${item.key}`} size='sm' c='red'>
					{translateError({ ...item, vars: {} })}
				</Text>
			))}
		</Stack>
	);
}
