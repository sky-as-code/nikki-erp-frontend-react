import { Code, List, Stack, Text } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorStatePage } from './ErrorStatePage';


export type InsufficientPermissionContentProps = {
	/** The expressions the caller lacks, exactly as a backend refusal would name them. */
	missing: string[],
};

/**
 * The refusal message: a hint followed by the required entitlements as real bullets.
 *
 * The list is rendered rather than interpolated into the sentence, so each entitlement stays
 * readable and copyable — an administrator acts on these literals verbatim.
 */
export function InsufficientPermissionContent(props: InsufficientPermissionContentProps): React.ReactElement {
	const { t: translate } = useTranslation();

	return (
		<Stack gap='sm' align='center'>
			<Text size='lg' c='dimmed' ta='center' maw={500}>
				{translate('insufficient_permission_hint')}
			</Text>
			<List size='sm' spacing='xs' withPadding>
				{props.missing.map(entitlement => (
					<List.Item key={entitlement}>
						<Code>{entitlement}</Code>
					</List.Item>
				))}
			</List>
		</Stack>
	);
}

export type InsufficientPermissionPageProps = InsufficientPermissionContentProps & {
	actions?: React.ReactNode,
};

/**
 * Rendered in place at the path the user asked for, so the URL still names the page they were
 * refused rather than a generic error route.
 */
export function InsufficientPermissionPage(props: InsufficientPermissionPageProps): React.ReactElement {
	const { t: translate } = useTranslation();

	return (
		<ErrorStatePage
			code='403'
			colorFrom='red'
			colorTo='orange'
			icon={<IconLock size={80} stroke={1.5} style={{ color: 'var(--mantine-color-red-6)', opacity: 0.8 }} />}
			title={translate('insufficient_permission_title')}
			message={<InsufficientPermissionContent missing={props.missing} />}
			actions={props.actions}
			testId='shell.insufficient-permission'
		/>
	);
}
