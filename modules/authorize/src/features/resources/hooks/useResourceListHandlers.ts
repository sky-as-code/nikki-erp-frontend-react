import React from 'react';

import { AuthorizeDispatch, resourceActions } from '../../../appState';
import { Resource } from '../types';


type ResourceFormModalState = { mode: 'create' | 'edit'; resource?: Resource };

function useResourceDetailHandlers(resources: Resource[]) {
	const [detailModalOpened, setDetailModalOpened] = React.useState(false);
	const [selectedResourceName, setSelectedResourceName] = React.useState<string | null>(null);

	const selectedResource = React.useMemo(() => {
		if (!selectedResourceName) return undefined;
		return resources.find((resource) => resource.name === selectedResourceName);
	}, [selectedResourceName, resources]);

	const handleViewDetail = React.useCallback((resourceName: string) => {
		setSelectedResourceName(resourceName);
		setDetailModalOpened(true);
	}, []);

	const closeDetailModal = React.useCallback(() => {
		setDetailModalOpened(false);
		setSelectedResourceName(null);
	}, []);

	return {
		selectedResource,
		handleViewDetail,
		detailModalOpened,
		closeDetailModal,
	};
}

function useResourceDeleteHandlers(resources: Resource[], dispatch: AuthorizeDispatch) {
	const [deleteModalOpened, setDeleteModalOpened] = React.useState(false);
	const [resourceToDelete, setResourceToDelete] = React.useState<Resource | null>(null);

	const handleDeleteRequest = React.useCallback((resourceId: string) => {
		const resource = resources.find((entry) => entry.id === resourceId);
		if (!resource) {
			return;
		}
		setResourceToDelete(resource);
		setDeleteModalOpened(true);
	}, [resources]);

	const confirmDelete = React.useCallback(() => {
		if (!resourceToDelete) {
			return;
		}
		dispatch(resourceActions.deleteResource({
			name: resourceToDelete.name,
		})).then(() => {
			setDeleteModalOpened(false);
			setResourceToDelete(null);
		});
	}, [dispatch, resourceToDelete]);

	const closeDeleteModal = React.useCallback(() => {
		setDeleteModalOpened(false);
		setResourceToDelete(null);
	}, []);

	return { deleteModalOpened, resourceToDelete, handleDeleteRequest, confirmDelete, closeDeleteModal };
}

function useResourceFormTypeHandlers(resources: Resource[]) {
	const [formModalState, setFormModalState] = React.useState<ResourceFormModalState | null>(null);

	const openCreateModal = React.useCallback(() => {
		setFormModalState({
			mode: 'create',
		});
	}, []);

	const openEditModal = React.useCallback((resourceId: string) => {
		const resource = resources.find((entry) => entry.id === resourceId);
		if (!resource) {
			return;
		}
		setFormModalState({
			mode: 'edit',
			resource,
		});
	}, [resources]);

	const closeFormModal = React.useCallback(() => {
		setFormModalState(null);
	}, []);

	return {
		formModalState,
		openCreateModal,
		openEditModal,
		closeFormModal,
	};
}

export const useResourceListHandlers = {
	detail: useResourceDetailHandlers,
	delete: useResourceDeleteHandlers,
	formType: useResourceFormTypeHandlers,
};
