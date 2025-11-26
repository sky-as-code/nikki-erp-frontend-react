import { Divider, Group, Stack, Text } from '@mantine/core';
import React from 'react';

import { ModelSchema } from '../../model';
import { extractLabel } from '../form';


export interface DetailViewProps {
	schema: ModelSchema;
	data: Record<string, unknown>;
	fields?: string[];
	excludeFields?: string[];
	showMetadata?: boolean;
}

export const DetailView: React.FC<DetailViewProps> = ({
	schema,
	data,
	fields,
	excludeFields = [],
	showMetadata = true,
}) => {
	const fieldsToShow = React.useMemo(() => {
		if (fields) {
			return fields.filter((f) => !excludeFields.includes(f));
		}
		return Object.keys(schema.fields).filter((f) => {
			const field = schema.fields[f];
			return !field.hidden && !excludeFields.includes(f);
		});
	}, [schema, fields, excludeFields]);

	return (
		<Stack gap='md'>
			{fieldsToShow.map((fieldName, index) => {
				const field = schema.fields[fieldName];
				if (!field) return null;

				const value = data[fieldName];
				const hasValue = value !== null && value !== undefined && value !== '';

				if (!hasValue && field.type !== 'string') {
					return null;
				}

				return (
					<React.Fragment key={fieldName}>
						{index > 0 && <Divider />}
						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{extractLabel(field.label || fieldName)}
							</Text>
							{field.type === 'string' ? (
								<Text size='sm'>{String(value || '—')}</Text>
							) : field.type === 'date' ? (
								<Text size='sm'>
									{value ? new Date(value as string).toLocaleString() : '—'}
								</Text>
							) : (
								<Text size='sm'>{String(value || '—')}</Text>
							)}
						</div>
					</React.Fragment>
				);
			})}

			{showMetadata && ((data.createdAt as string) || (data.updatedAt as string)) && (
				<>
					<Divider />
					<Group>
						{(data.createdAt as string) && (
							<div style={{ flex: 1 }}>
								<Text size='sm' c='dimmed'>Created At</Text>
								<Text size='sm'>{new Date(data.createdAt as string).toLocaleString()}</Text>
							</div>
						)}
						{(data.updatedAt as string) && (
							<div style={{ flex: 1 }}>
								<Text size='sm' c='dimmed'>Updated At</Text>
								<Text size='sm'>{new Date(data.updatedAt as string).toLocaleString()}</Text>
							</div>
						)}
					</Group>
				</>
			)}
		</Stack>
	);
};

