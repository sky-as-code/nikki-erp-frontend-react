import { Stack } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import { useMicroAppDispatch, useMicroAppSelector } from '@nikkierp/ui/microApp';
import { ModelSchema } from '@nikkierp/ui/model';
import React from 'react';
import { useNavigate, useParams } from 'react-router';

import { useUIState } from '../../../../shell/src/context/UIProviders';
import { IdentityDispatch, hierarchyActions, selectHierarchyState } from '../../appState';
import { HeaderCreatePage } from '../../components/HeaderCreatePage';
import { HierarchyCreateForm } from '../../features/hierarchy/components';
import { HierarchyLevel } from '../../features/hierarchy/types';
import hierarchySchema from '../../schemas/hierarchy-schema.json';


function useHierarchyCreateHandlers() {
	const navigate = useNavigate();
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const { orgSlug } = useParams<{ orgSlug: string }>();
	const { notification } = useUIState();

	const handleCreate = React.useCallback((data: any) => {
		// Clean up parentId - remove if empty string
		const cleanedData = {
			...data,
			parentId: data.parentId && data.parentId !== '' ? data.parentId : undefined,
		};

		dispatch(hierarchyActions.createHierarchy({ orgSlug: orgSlug!, data: cleanedData }))
			.unwrap()
			.then(() => {
				notification.showInfo('Hierarchy created successfully', 'Success');
				navigate('..', { relative: 'path' });
			})
			.catch(() => {
				notification.showError('Failed to create hierarchy. Please try again.', 'Error');
			});
	}, [dispatch, navigate, orgSlug, notification]);

	return {
		handleCreate,
	};
}

export const HierarchyCreatePageBody: React.FC = () => {
	const dispatch: IdentityDispatch = useMicroAppDispatch();
	const { isCreatingHierarchy, hierarchies } = useMicroAppSelector(selectHierarchyState);
	const { orgSlug } = useParams<{ orgSlug: string }>();

	// Fetch hierarchies list for parent selection
	React.useEffect(() => {
		if (orgSlug) {
			dispatch(hierarchyActions.listHierarchies(orgSlug));
		}
	}, [dispatch, orgSlug]);

	// Create schema with dynamic enum options for parentId
	const schema = React.useMemo(() => {
		const updatedSchema = { ...hierarchySchema } as ModelSchema;

		if (updatedSchema.fields.parentId) {
			updatedSchema.fields.parentId = {
				...updatedSchema.fields.parentId,
				type: 'enum',
				enum: [
					{ value: '', label: '(No Parent)' },
					...hierarchies.map((h: HierarchyLevel) => ({
						value: h.id,
						label: h.name,
					})),
				],
			};
		}

		return updatedSchema;
	}, [hierarchies]);

	const { handleCreate } = useHierarchyCreateHandlers();

	return (
		<Stack gap='md'>
			<HeaderCreatePage
				title='nikki.identity.hierarchy.title'
			/>
			<HierarchyCreateForm
				schema={schema}
				isCreating={isCreatingHierarchy}
				onSubmit={handleCreate}
			/>
		</Stack>
	);
};

export const HierarchyCreatePage: React.FC = withWindowTitle('Create Hierarchy', HierarchyCreatePageBody);
