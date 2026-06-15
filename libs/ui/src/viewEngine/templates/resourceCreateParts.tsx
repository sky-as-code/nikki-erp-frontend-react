import { ActionIcon, Anchor, Button, Group, Stack, Text, Title } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import { IconChevronDown, IconChevronRight, IconDeviceFloppy } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';
import { Link } from 'react-router';

import { useResourceCreateContext } from './resourceCreateContext';
import classes from './ResourceDetail.module.css';
import { useResourceDetailContext, useResourceDetailTranslationNs } from './ResourceDetailProvider';
import { AutoField } from '../../components/form';
import { useLocalize, useTranslate } from '../../i18n';

import type { LinkSpec, OwnPropertySection, SchemaFieldSpec } from './ResourceDetail';


export type ResourceCreateHeaderProps = {
	titleLvl1?: SchemaFieldSpec,
	titleLvl3?: LinkSpec,
};

/** Title overrides fall back to the values held in the resource-create context. */
export function ResourceCreateHeader(headerProps: ResourceCreateHeaderProps = {}): React.ReactNode {
	const { schemaPack } = useResourceDetailContext();
	const context = useResourceCreateContext();
	const titleLvl1 = headerProps.titleLvl1 ?? context.titleLvl1;
	const titleLvl3 = headerProps.titleLvl3 ?? context.titleLvl3;
	const t = useTranslate(useResourceDetailTranslationNs());
	const localize = useLocalize(useResourceDetailTranslationNs());
	const modelSchema = schemaPack?.modelSchema;
	const resourceName = localize(modelSchema?.label, { count: 99 });
	const showTitleLvl3 = Boolean(titleLvl3 && modelSchema);

	return (
		<Group gap={4}>
			<Stack gap={4}>
				{titleLvl1 ? (
					<Title order={3}>
						<span className='capitalize'>{t('form.newResource', { resource: resourceName })}</span>
					</Title>
				) : null}
				{showTitleLvl3 ? (
					<Anchor
						component={Link}
						to={titleLvl3!.linkHref}
						relative='path'
						size='md'
						className='capitalize'
					>
						{resourceName}
					</Anchor>
				) : null}
			</Stack>
		</Group>
	);
}

export type ResourceCreateActionBarProps = {
	expanded: boolean,
	onToggleCollapse: () => void,
	onSaveClick: () => void,
	isLoading: boolean,
};

export function ResourceCreateActionBar({
	expanded, onToggleCollapse, onSaveClick, isLoading,
}: ResourceCreateActionBarProps): React.ReactNode {
	const t = useTranslate(useResourceDetailTranslationNs());
	return (
		<Group gap='xs' align='center' className={clsx('sticky top-0 py-4', classes.bgBodyColor)}>
			<ActionIcon variant='subtle' size='sm' onClick={onToggleCollapse} aria-label='Toggle own properties'>
				{expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
			</ActionIcon>
			<Button
				variant='filled'
				size='compact-md'
				leftSection={<IconDeviceFloppy size={16} />}
				onClick={onSaveClick}
				disabled={isLoading}
				loading={isLoading}
				type='submit'
			>
				{t('action.save')}
			</Button>
		</Group>
	);
}

export function ResourceCreateBlock({
	block, isLoading,
}: {
	block: OwnPropertySection,
	isLoading: boolean,
}): React.ReactNode {
	const { schemaPack } = useResourceDetailContext();
	const t = useTranslate(useResourceDetailTranslationNs());
	const modelSchema = schemaPack?.modelSchema;

	if (!modelSchema) {
		return null;
	}

	return (
		<Stack gap='sm' className={classes.formBlock}>
			<Title order={4}>{t(block.header)}</Title>
			<ResourceCreateFieldGroup fields={block.fields ?? []} isLoading={isLoading} modelSchema={modelSchema} />
		</Stack>
	);
}

function ResourceCreateFieldGroup({
	fields, isLoading, modelSchema,
}: {
	fields: string[],
	isLoading: boolean,
	modelSchema: dyn.ModelSchema,
}): React.ReactNode {
	if (fields.length === 0) {
		return <Text c='dimmed'>No fields configured</Text>;
	}

	return (
		<div className={classes.formFieldWrapper}>
			{fields.map(field => {
				const fieldDef = modelSchema.fields[field];
				if (!fieldDef || fieldDef.is_system_field || fieldDef.is_primary_key) {
					return null;
				}
				return (
					<Stack key={field} gap={4}>
						<AutoField name={field} inputProps={{ disabled: isLoading }} />
					</Stack>
				);
			})}
		</div>
	);
}
