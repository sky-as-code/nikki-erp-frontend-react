import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import React from 'react';
import { useParams } from 'react-router';

import { AuthorizeDispatch, resourceActions, selectResourceDetail } from '@/appState';


export function useResourceDetail() {
	const { resourceName } = useParams<{ resourceName: string }>();
	const dispatch: AuthorizeDispatch = useMicroAppDispatch();
	const detail  = useMicroAppSelector(selectResourceDetail);

	React.useEffect(() => {
		console.log('resourceName', resourceName);
		if (resourceName) {
			dispatch(resourceActions.getResource(resourceName));
		}
	}, [resourceName]);

	return {
		resource: detail.data,
		isLoading: detail.status === 'pending' || detail.status === 'idle',
	};
}
