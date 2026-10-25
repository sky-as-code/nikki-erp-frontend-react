import { useRef, useState } from 'react';



type UseModuleSearchInputProps = {
	searchInputValue: string,
	onSearchChange: (value: string) => void,
	onSearchClear: () => void,
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
