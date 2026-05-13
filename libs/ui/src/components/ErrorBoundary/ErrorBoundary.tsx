import { Alert, Button, Group, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import React from 'react';

import { useTranslate } from '../../i18n';


export function withErrorBoundary<T extends object>(
	Component: React.ComponentType<T>,
): React.ComponentType<T> {
	return (props: T) => (
		<ErrorBoundary>
			<Component {...props} />
		</ErrorBoundary>
	);
}

export type ErrorBoundaryProps = {
	children: React.ReactNode;
};

type ErrorBoundaryState = {
	error: Error | null;
};

/** Catches render/lifecycle errors in the  tree so the app does not blank the screen. */
export class ErrorBoundary extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	public constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { error: null };
	}

	public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { error };
	}

	public componentDidCatch(error: Error, info: React.ErrorInfo): void {
		console.error('[MicroApp] Uncaught UI error', error, info.componentStack);
	}

	private handleRetry = (): void => {
		this.setState({ error: null });
	};

	public render(): React.ReactNode {
		const { error } = this.state;
		if (!error) return this.props.children;

		return (
			<ErrorAlert error={error} handleRetry={this.handleRetry} />
		);
	}
}

function ErrorAlert({ error, handleRetry }: { error: unknown, handleRetry: () => void }): React.ReactNode {
	const t = useTranslate('common');
	return (
		<Group className='w-full p-4' justify='center' align='center'>
			<Alert variant='outline' color='red' title={t('error.error_occurred')} icon={<IconAlertCircle />}>
				<Text>{t('error.contact_support')}</Text>
			</Alert>
		</Group>
	);
}
