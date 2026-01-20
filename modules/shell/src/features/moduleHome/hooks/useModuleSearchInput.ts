import { RefObject, useEffect, useRef, useState } from 'react';



type UseModuleSearchInputProps = {
	searchInputValue: string;
	onSearchChange: (value: string) => void;
	onSearchClear: () => void;
};

export function useModuleSearchInput({
	searchInputValue,
	onSearchChange,
	onSearchClear,
}: UseModuleSearchInputProps) {
	const [isFocused, setIsFocused] = useState<boolean>(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		onSearchChange(event.currentTarget.value);
	};

	const handleClear = (event: React.MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
		onSearchClear();
	};

	const handleFocus = () => { setIsFocused(true); };

	const handleBlur = () => { setIsFocused(false);};

	useKeyboardShortcut(inputRef);

	return {
		isFocused,
		inputRef,
		searchInputValue,
		handleChange,
		handleClear,
		handleFocus,
		handleBlur,
	};
}

function useKeyboardShortcut(inputRef: RefObject<HTMLInputElement | null>) {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// Check for Ctrl+K (Windows/Linux) or Cmd+K (Mac)
			if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
				event.preventDefault();
				inputRef.current?.focus();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [inputRef]);
}