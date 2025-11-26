import { Breadcrumbs, Group, TagsInput, Typography } from '@mantine/core';
import React from 'react';


export const ResourceListHeader: React.FC = () => {
	return (
		<Group>
			<Breadcrumbs style={{
				minWidth: '30%',
			}}>
				<Typography>
					<h4>Resources</h4>
				</Typography>
			</Breadcrumbs>
			<TagsInput
				placeholder='Search'
				w='500px'
			/>
		</Group>
	);
};


