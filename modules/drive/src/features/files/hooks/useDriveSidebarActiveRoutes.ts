import { useLocation } from 'react-router';


export function useDriveSidebarActiveRoutes(): {
	isMyFilesActive: boolean;
	isSharedActive: boolean;
	isStarredActive: boolean;
	isTrashActive: boolean;
} {
	const location = useLocation();
	const isMyFilesActive = location.pathname.endsWith('/management/my-files');
	const isSharedActive = location.pathname.endsWith('/management/shared-with-me');
	const isStarredActive = location.pathname.endsWith('management/starred');
	const isTrashActive = location.pathname.endsWith('/management/trash');

	return {
		isMyFilesActive,
		isSharedActive,
		isStarredActive,
		isTrashActive,
	};
}
