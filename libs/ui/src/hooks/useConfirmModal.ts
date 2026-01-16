import React from 'react';


export function useConfirmModal<T>() {
	const [isOpen, setIsOpen] = React.useState(false);
	const [item, setItem] = React.useState<T | null>(null);

	const configOpenModal = (item: T) => {
		setItem(item);
		setIsOpen(true);
	};

	const handleCloseModal = () => {
		setItem(null);
		setIsOpen(false);
	};

	return { isOpen, item, configOpenModal, handleCloseModal };
}
