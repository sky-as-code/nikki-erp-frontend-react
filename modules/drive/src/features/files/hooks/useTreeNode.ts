import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { useCallback } from 'react';

import { driveFileActions, selectGetDriveFileByParentForTree } from '@/appState/file';


export function useTreeNode(parentId: string) {
	const dispatch = useMicroAppDispatch();
	const getByParentForTree = useMicroAppSelector(selectGetDriveFileByParentForTree);

	const load = useCallback(
		(targetParentId?: string, page = 0, size = 20) => {
			const id = targetParentId ?? parentId;
			(dispatch as (action: unknown) => void)(
				driveFileActions.getDriveFileByParentForTree({
					parentId: id,
					req: { page, size },
				}),
			);
		},
		[dispatch, parentId],
	);

	return {
		load,
		isLoading: getByParentForTree.status === 'pending',
	};
}
