import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { fileService } from '../fileService';
import { DriveFileStatus } from '../types';

import type { DriveFile } from '../types';

export type FileSelectorMode = 'file' | 'folder';

type TabKey = 'my-files' | 'shared-with-me';

export type UseFileSelectorListParams = {
	parentId: string;
	activeTab: TabKey;
	mode: FileSelectorMode;
	multiple: boolean;
	onSelect: (ids: string[] | string) => void;
};

export function useFileSelectorList({
	parentId,
	activeTab,
	mode,
	multiple,
	onSelect,
}: UseFileSelectorListParams) {
	const { t } = useTranslation();
	const [currentParentId, setCurrentParentId] = useState<string>(parentId);
	const [items, setItems] = useState<DriveFile[]>([]);
	const [ancestors, setAncestors] = useState<DriveFile[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const isFolderMode = mode === 'folder';

	const loadList = useCallback(async (parent: string) => {
		setLoading(true);
		setError(null);
		try {
			const res = await fileService.getDriveFileByParent(parent, {
				page: 0,
				size: 200,
				graph: {
					if: ['status', '!=', DriveFileStatus.IN_TRASH],
				},
			});
			setItems(res.items ?? []);
		}
		catch (e) {
			const fallback = e instanceof Error ? e.message : t('nikki.drive.errors.failedToLoadFiles');
			setError(fallback);
			setItems([]);
		}
		finally {
			setLoading(false);
		}
	}, []);

	const loadAncestors = useCallback(async (parent: string) => {
		if (!parent) {
			setAncestors([]);
			return;
		}
		try {
			const chain = await fileService.getDriveFileAncestors(parent);
			setAncestors(chain ?? []);
		}
		catch {
			setAncestors([]);
		}
	}, []);

	useEffect(() => {
		if (activeTab !== 'my-files') return;
		setCurrentParentId(parentId);
	}, [activeTab, parentId]);

	useEffect(() => {
		if (activeTab !== 'my-files') return;
		void loadList(currentParentId);
		void loadAncestors(currentParentId);
	}, [activeTab, currentParentId, loadList, loadAncestors]);

	useEffect(() => {
		if (!isFolderMode) return;
		if (activeTab !== 'my-files') return;
		onSelect(currentParentId);
	}, [isFolderMode, activeTab, currentParentId, onSelect]);

	const visibleItems = useMemo(() => {
		if (isFolderMode) {
			return items.filter((f) => f.isFolder);
		}
		return items;
	}, [items, isFolderMode]);

	const handleOpenFolder = useCallback((folder: DriveFile) => {
		if (!folder.isFolder) return;
		if (isFolderMode) {
			onSelect(folder.id);
		}
		setCurrentParentId(folder.id);
	}, [isFolderMode, onSelect]);

	const handleSelectFile = useCallback((file: DriveFile) => {
		if (file.isFolder) {
			handleOpenFolder(file);
			return;
		}
		if (multiple && !isFolderMode) {
			onSelect([file.id]);
		}
		else {
			onSelect(file.id);
		}
	}, [multiple, isFolderMode, onSelect, handleOpenFolder]);

	const breadcrumbItems = useMemo(() => {
		if (activeTab !== 'my-files') return [];
		const base = [{ id: '', name: t('nikki.drive.myFiles') }];
		return [...base, ...ancestors];
	}, [activeTab, ancestors, t]);

	return {
		visibleItems,
		breadcrumbItems,
		loading,
		error,
		currentParentId,
		setCurrentParentId,
		handleOpenFolder,
		handleSelectFile,
		isFolderMode,
	};
}
