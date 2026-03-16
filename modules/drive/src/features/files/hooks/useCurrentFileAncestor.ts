import { useMicroAppSelector } from '@nikkierp/ui/microApp';
import { useEffect, useState } from 'react';

import { DriveFile } from '../types';

import { selectDriveFileAncestors } from '@/appState/file';


export function useCurrentFileSortedAncestors(): DriveFile[] {
	const currentFileAncestors = useMicroAppSelector(selectDriveFileAncestors);
	const [ancestors, setAncestors] = useState<DriveFile[]>([]);

	useEffect(() => {
		const ancestorMap = new Map<string, DriveFile>();
		for (const ancestor of currentFileAncestors) {
			ancestorMap.set(ancestor.parentDriveFileRef, ancestor);
		}

		const sortedAncestors: DriveFile[] = [];

		for (const ancestor of currentFileAncestors) {
			if (ancestor.parentDriveFileRef === '') {
				sortedAncestors.push(ancestor);
				break;
			}
		}

		while (sortedAncestors.length < currentFileAncestors.length) {
			const currentAncestor = sortedAncestors[sortedAncestors.length - 1];
			if (ancestorMap.has(currentAncestor.id)) {
				const parentAncestor = ancestorMap.get(currentAncestor.id)!;
				sortedAncestors.push(parentAncestor);
			}
			else {
				break;
			}
		}

		setAncestors(sortedAncestors);
	}, [currentFileAncestors]);

	return ancestors;
}
