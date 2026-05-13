import React from 'react';


export type ShellErrorBoundaryProps = {
	children: React.ReactNode;
};

type ShellErrorBoundaryState = {
	error: Error | null;
};

/** Catches render/lifecycle errors in the shell tree so the app does not blank the screen. */
export class ShellErrorBoundary extends React.Component<
	ShellErrorBoundaryProps,
	ShellErrorBoundaryState
> {
	public constructor(props: ShellErrorBoundaryProps) {
		super(props);
		this.state = { error: null };
	}

	public static getDerivedStateFromError(error: Error): ShellErrorBoundaryState {
		return { error };
	}

	public componentDidCatch(error: Error, info: React.ErrorInfo): void {
		console.error('[MicroAppShell] Uncaught UI error', error, info.componentStack);
	}

	private handleRetry = (): void => {
		this.setState({ error: null });
	};

	public render(): React.ReactNode {
		const { error } = this.state;
		if (!error) return this.props.children;

		return (
			<div
				className='min-h-screen flex flex-col items-center justify-center gap-4 p-8 bg-gray-50 text-gray-900'
				role='alert'
			>
				<h1 className='text-xl font-semibold'>Something went wrong</h1>
				<p className='text-sm text-gray-600 text-center max-w-md'>
					The application hit an unexpected error. You can try again or reload the page.
				</p>
				{import.meta.env.DEV && (
					<pre className='text-xs text-red-700 bg-red-50 p-3 rounded max-w-full overflow-auto max-h-40'>
						{error.message}
					</pre>
				)}
				<div className='flex flex-wrap gap-3 justify-center'>
					<button
						type='button'
						className='px-4 py-2 rounded-md bg-gray-200 text-gray-900 text-sm font-medium hover:bg-gray-300'
						onClick={this.handleRetry}
					>
						Try again
					</button>
					<button
						type='button'
						className='px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700'
						onClick={() => window.location.reload()}
					>
						Reload page
					</button>
				</div>
			</div>
		);
	}
}
