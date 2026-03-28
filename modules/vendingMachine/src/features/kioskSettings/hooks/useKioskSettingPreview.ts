import { useState } from 'react';

import { type KioskSetting } from '../types';
import { useKioskSettingDetail } from './useKioskSettingDetail';


export const useKioskSettingPreview = () => {
	const [isOpenPreview, setIsOpenPreview] = useState(false);
	const [selectedKioskSetting, setSelectedKioskSetting] = useState<KioskSetting | undefined>();

	const { setting: settingDetail, isLoading } = useKioskSettingDetail(selectedKioskSetting?.id);

	const handlePreview = (setting: KioskSetting) => {
		setSelectedKioskSetting(setting);
		setIsOpenPreview(true);
	};

	const handleClosePreview = () => {
		setIsOpenPreview(false);
		setSelectedKioskSetting(undefined);
	};

	return {
		isOpenPreview,
		handlePreview,
		handleClosePreview,
		selectedSetting: settingDetail,
		isLoadingPreview: isLoading,
	};
};
