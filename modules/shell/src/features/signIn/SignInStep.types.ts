import React from 'react';


export type SignInStepProps = {
	ref?: React.RefObject<HTMLInputElement | null>,
	isActive?: boolean,
	onNext?: () => void,
	onBack?: () => void,
};


export type BaseFormContentProps = {
	ref?: React.RefObject<HTMLInputElement | null>,
	isActive: boolean,
	isLoading: boolean,
	/** What the server refused the step with, shown translated under the input. */
	clientErrors?: ReadonlyArray<{ key: string, message: string, field?: string }>,
};
