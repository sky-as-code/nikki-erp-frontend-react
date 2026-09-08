import { Center, Group, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import React from 'react';


/**
 * The full-page error state shared by Not Found, Unauthorized and Insufficient Permission.
 *
 * Presentational on purpose: the "Go Home" destination comes from the user context, which lives in
 * `@nikkierp/shell` and is not a dependency of this package. Callers pass the buttons in through
 * `actions` rather than this component reaching for the store.
 */
export type ErrorStatePageProps = {
	/** The large status number, e.g. `404`. */
	code: string,
	/** Mantine palette name used for the gradient and the icon, e.g. `'blue'`. */
	colorFrom: string,
	colorTo: string,
	icon: React.ReactNode,
	title: string,
	/** A string, or richer content such as the entitlement list of a permission refusal. */
	message: React.ReactNode,
	actions?: React.ReactNode,
	testId?: string,
};

export function ErrorStatePage(props: ErrorStatePageProps): React.ReactElement {
	const theme = useMantineTheme();
	const gradient = `linear-gradient(135deg, ${theme.colors[props.colorFrom][6]} 0%, ${theme.colors[props.colorTo][6]} 100%)`;

	return (
		<Center h='100%' data-testid={props.testId}>
			<Stack align='center' gap='lg' p={{ base: 'md', sm: 'xl' }}>
				<Stack align='center' gap={0}>
					<Title
						order={1}
						size='8rem'
						fw={900}
						style={{
							background: gradient,
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
							backgroundClip: 'text',
							lineHeight: 1,
							fontFamily: 'Space Grotesk, sans-serif',
						}}
					>
						{props.code}
					</Title>
				</Stack>

				{props.icon}

				<Stack align='center' gap='xs'>
					<Title order={2} size='2rem' fw={600} ta='center'>
						{props.title}
					</Title>
					{typeof props.message === 'string'
						? (
							<Text size='lg' c='dimmed' ta='center' maw={500}>
								{props.message}
							</Text>
						)
						: props.message}
				</Stack>

				{props.actions && <Group gap='md' mt='xl'>{props.actions}</Group>}
			</Stack>
		</Center>
	);
}

/** The gradient used on the primary action, so a caller's button matches the heading. */
export function errorStateGradient(theme: ReturnType<typeof useMantineTheme>, from: string, to: string): string {
	return `linear-gradient(135deg, ${theme.colors[from][6]} 0%, ${theme.colors[to][6]} 100%)`;
}
