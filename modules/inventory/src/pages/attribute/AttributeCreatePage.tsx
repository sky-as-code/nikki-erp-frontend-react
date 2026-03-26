import { Stack } from '@mantine/core';
import { withWindowTitle } from '@nikkierp/ui/components';
import React from 'react';
import { useNavigate } from 'react-router';

import { ControlPanelAction } from '../../components/ControlPanel';
import { PageContainer } from '../../components/PageContainer';
import { AttributeCreateForm } from '../../features/attribute/components';
import { useAttributeCreateHandlers } from '../../features/attribute/hooks';


export const AttributeCreatePageBody: React.FC = () => {
	const { isLoading, onSubmit } = useAttributeCreateHandlers();
	const navigate = useNavigate();
	const formId = 'attribute-create-form';
	const breadcrumbs = [
		{ title: 'Inventory', href: '../overview' },
		{ title: 'Attributes', href: '../attributes' },
		{ title: 'Create Attribute', href: '#' },
	];

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			sections={[
				<ControlPanelAction
					actions={[
						{ label: 'Cancel', variant: 'outline', onClick: () => navigate(-1) },
						{ label: 'Create', type: 'submit', form: formId },
					]}
				/>,
			]}
		>
			<AttributeCreateForm
				isLoading={isLoading}
				onSubmit={onSubmit}
				formId={formId}
			/>
		</PageContainer>
	);
};

export const AttributeCreatePage = withWindowTitle('Create Attribute', AttributeCreatePageBody);