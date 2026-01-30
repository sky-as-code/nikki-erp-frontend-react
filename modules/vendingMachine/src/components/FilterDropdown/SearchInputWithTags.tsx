import { Badge, Box, Group, TextInput, TextInputProps, Combobox, useCombobox } from '@mantine/core';
import { IconSearch, IconX, IconChevronDown } from '@tabler/icons-react';
import React, { useRef, useState, useEffect } from 'react';

import { FilterTag, SearchConfig } from './types';


export interface SearchInputWithTagsProps extends Omit<TextInputProps, 'value' | 'onChange'> {
	tags: FilterTag[];
	onTagRemove: (tag: FilterTag) => void;
	onSearchChange: (fieldKey: string, value: string) => void;
	searchValue?: string; // Optional, chỉ dùng để reset khi cần
	searchFields?: SearchConfig[];
}

export const SearchInputWithTags: React.FC<SearchInputWithTagsProps> = ({
	tags,
	onTagRemove,
	onSearchChange,
	searchValue,
	placeholder = 'Tìm kiếm...',
	searchFields = [],
	...textInputProps
}) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isFocused, setIsFocused] = useState(false);
	const [selectedField, setSelectedField] = useState<SearchConfig | null>(null);
	const [inputValue, setInputValue] = useState('');
	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
	});

	const handleTagRemove = (tag: FilterTag, e: React.MouseEvent) => {
		e.stopPropagation();
		onTagRemove(tag);
	};

	const handleFieldSelect = (fieldKey: string) => {
		const field = searchFields.find((f) => f.key === fieldKey);
		if (field) {
			// Nếu đã có giá trị nhập vào, tự động thêm tag ngay lập tức
			if (inputValue.trim()) {
				onSearchChange(field.key, inputValue);
				setInputValue('');
				setSelectedField(null);
			}
			else {
				// Nếu chưa có giá trị, chỉ chọn field để user có thể nhập tiếp
				setSelectedField(field);
			}
			combobox.closeDropdown();
			inputRef.current?.focus();
		}
	};

	const handleInputChange = (value: string) => {
		if (selectedField) {
			setInputValue(value);
		}
		else {
			// Khi chưa chọn field, lưu giá trị vào inputValue để hiện dropdown
			setInputValue(value);
			// Nếu có giá trị và đang focus, mở dropdown để chọn field
			if (value.trim() !== '' && isFocused && searchFields.length > 0) {
				combobox.openDropdown();
			}
		}
	};

	const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			if (selectedField && inputValue.trim()) {
				// Đã chọn field và có giá trị, thêm tag
				onSearchChange(selectedField.key, inputValue);
				setInputValue('');
				setSelectedField(null);
				combobox.closeDropdown();
			}
			else if (!selectedField && inputValue.trim() && searchFields.length > 0) {
				// Chưa chọn field nhưng có giá trị, mở dropdown để chọn field
				combobox.openDropdown();
			}
		}
	};

	const handleInputBlur = () => {
		// Delay để cho phép click vào dropdown option
		setTimeout(() => {
			setIsFocused(false);
			combobox.closeDropdown();
			// Nếu đã chọn field và có giá trị, tự động thêm tag
			if (selectedField && inputValue.trim()) {
				onSearchChange(selectedField.key, inputValue);
				setInputValue('');
				setSelectedField(null);
			}
			else if (!selectedField && inputValue.trim()) {
				// Nếu chưa chọn field nhưng có giá trị, xóa giá trị đã nhập (bấm ra ngoài)
				setInputValue('');
			}
			else {
				// Nếu không có giá trị, reset
				setInputValue('');
			}
		}, 200);
	};

	useEffect(() => {
		// Reset inputValue khi không có field được chọn và không focus
		if (!selectedField && !isFocused && inputValue.trim() === '') {
			setInputValue('');
		}
	}, [selectedField, isFocused]);

	// Chỉ hiện dropdown khi đã có giá trị nhập vào và chưa chọn field
	const shouldShowDropdown = searchFields.length > 0 && !selectedField && isFocused && inputValue.trim() !== '';

	// Khi có giá trị nhập vào, tự động mở dropdown
	useEffect(() => {
		if (inputValue.trim() !== '' && !selectedField && isFocused && searchFields.length > 0) {
			combobox.openDropdown();
		}
		else if (!isFocused || selectedField) {
			combobox.closeDropdown();
		}
	}, [inputValue, selectedField, isFocused, searchFields.length]);

	return (
		<Box
			style={{
				position: 'relative',
				minWidth: 300,
			}}
		>
			{tags.length > 0 && (
				<Group
					gap='xs'
					wrap='wrap'
					mb='xs'
					style={{
						minHeight: 24,
					}}
				>
					{tags.map((tag, index) => (
						<Badge
							key={`${tag.type}-${tag.key}-${index}`}
							size='sm'
							variant='light'
							color='blue'
							rightSection={
								<IconX
									size={12}
									style={{ cursor: 'pointer', marginLeft: 4 }}
									onClick={(e) => {
										e.stopPropagation();
										handleTagRemove(tag, e);
									}}
								/>
							}
							style={{
								cursor: 'default',
							}}
						>
							{tag.label}: {Array.isArray(tag.value) ? tag.value.join(' or ') : tag.value}
						</Badge>
					))}
				</Group>
			)}
			<Combobox
				store={combobox}
				onOptionSubmit={handleFieldSelect}
				withinPortal={false}
			>
				<Combobox.Target>
					<TextInput
						ref={inputRef}
						placeholder={
							selectedField
								? `${selectedField.label}: ${placeholder}`
								: placeholder
						}
						leftSection={<IconSearch size={16} />}
						rightSection={
							shouldShowDropdown ? (
								<IconChevronDown size={16} style={{ cursor: 'pointer' }} />
							) : selectedField ? (
								<IconX
									size={16}
									style={{ cursor: 'pointer' }}
									onClick={(e) => {
										e.stopPropagation();
										setSelectedField(null);
										setInputValue('');
									}}
								/>
							) : null
						}
						value={inputValue}
						onChange={(e) => {
							const value = e.currentTarget.value;
							handleInputChange(value);
						}}
						onFocus={() => {
							setIsFocused(true);
							// Nếu đã có giá trị nhập vào, mở dropdown để chọn field
							if (searchFields.length > 0 && !selectedField && inputValue.trim() !== '') {
								combobox.openDropdown();
							}
						}}
						onBlur={handleInputBlur}
						onKeyDown={handleInputKeyDown}
						onClick={() => {
							// Nếu đã có giá trị nhập vào, mở dropdown để chọn field
							if (searchFields.length > 0 && !selectedField && inputValue.trim() !== '') {
								combobox.openDropdown();
							}
						}}
						style={{
							position: 'relative',
							zIndex: 2,
						}}
						{...textInputProps}
					/>
				</Combobox.Target>

				{shouldShowDropdown && (
					<Combobox.Dropdown>
						<Combobox.Options>
							{searchFields.map((field) => (
								<Combobox.Option value={field.key} key={field.key}>
									{field.label}
								</Combobox.Option>
							))}
						</Combobox.Options>
					</Combobox.Dropdown>
				)}
			</Combobox>
		</Box>
	);
};
