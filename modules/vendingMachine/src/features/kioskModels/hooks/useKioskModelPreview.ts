import { useState } from 'react';

import { KioskModel } from '../types';


export const useKioskModelPreview = () => {
	const [isOpenDetailModal, setIsOpenDetailModal] = useState(false);
	const [selectedModelId, setSelectedModelId] = useState<string | undefined>();

	const handlePreview = (kioskModel: KioskModel) => {
		setSelectedModelId(kioskModel.id);
		setIsOpenDetailModal(true);
	};

	const handleCloseDetailModal = () => {
		setIsOpenDetailModal(false);
		setSelectedModelId(undefined);
	};

	return {
		isOpenDetailModal,
		handlePreview,
		handleCloseDetailModal,
		selectedModelId,
	};
};
