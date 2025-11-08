import { useDispatch } from 'react-redux';

import { MicroAppDispatchFn, useIsMicroApp, useMicroAppDispatch } from '../microApp';


export function useSmartDispatch(): MicroAppDispatchFn {
	const isMicroApp = useIsMicroApp();
	if (isMicroApp) {
		return useMicroAppDispatch();
	}
	return useDispatch();
}