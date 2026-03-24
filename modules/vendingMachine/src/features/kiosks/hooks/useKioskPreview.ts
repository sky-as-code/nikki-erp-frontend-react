import { useState } from 'react';

import { type Kiosk } from '../types';
import { useKioskDetail } from './useKioskDetail';


export const useKioskPreview = () => {
	const [isOpenPreview, setIsOpenPreview] = useState(false);
	const [selectedKiosk, setSelectedKiosk] = useState<Kiosk | undefined>();

	const { kiosk: kioskDetail, isLoading } = useKioskDetail(selectedKiosk?.id || '');

	const handlePreview = (kiosk: Kiosk) => {
		setSelectedKiosk(kiosk);
		setIsOpenPreview(true);
	};

	const handleClosePreview = () => {
		setIsOpenPreview(false);
		setSelectedKiosk(undefined);
	};

	return {
		isOpenPreview,
		handlePreview,
		handleClosePreview,
		selectedKiosk: kioskDetail,
		isLoadingPreview: isLoading,
	};
};
