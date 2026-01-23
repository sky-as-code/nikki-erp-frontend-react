import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';

import { VendingMachineDispatch, kioskTemplateActions, selectKioskTemplateDetail } from '@/appState';


export function useKioskTemplateDetail(templateId?: string) {
	const dispatch: VendingMachineDispatch = useMicroAppDispatch();
	const detail = useMicroAppSelector(selectKioskTemplateDetail);

	React.useEffect(() => {
		if (templateId) {
			dispatch(kioskTemplateActions.getKioskTemplate(templateId));
		}
	}, [templateId, dispatch]);

	return {
		template: detail.data,
		isLoading: detail.status === 'pending' || detail.status === 'idle',
	};
}

