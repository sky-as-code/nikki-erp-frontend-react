import React from 'react';


export type SignInStepProps = {
	ref?: React.RefObject<HTMLInputElement | null>;
	isActive?: boolean;
	onNext?: () => void;
	onBack?: () => void;
};


export type BaseFormContentProps = {
	ref?: React.RefObject<HTMLInputElement | null>;
	isActive: boolean;
	isLoading: boolean;
};
