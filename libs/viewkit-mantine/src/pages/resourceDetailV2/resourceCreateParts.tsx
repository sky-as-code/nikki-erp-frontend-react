import { ActionIcon, Anchor, Group, Stack, Text, Title } from '@mantine/core';
import { Button } from '@nikkierp/ui/components';
import { useCrudFormRuntime } from '@nikkierp/ui/components/form';
import { useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import { commandAttrs } from '@nikkierp/viewengine/core';
import { IconChevronDown, IconChevronRight, IconDeviceFloppy } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';
import { Link } from 'react-router';

import { useDetailFieldDisplay } from './detailFieldDisplay';
import { isBlockVisible } from './fieldVisibility';
import { FieldGroupVertical } from './ownPropertiesBlock';
import { useResourceCreateContext } from './resourceCreateContext';
import classes from './ResourceDetail.module.css';
import { formBlockSpanClass } from '../../components/formBlockSpan';
import { StandardActionCode, useActionLock } from '../../permissions';
import {
	useResourceDetailContext, useResourceDetailSchemaName, useResourceDetailTestAttrs, useResourceDetailTranslationNs,
} from '../resourceDetail/ResourceDetailProvider';
import { SplitPaneCloseButton } from '../resourceDetail/SplitPaneCloseButton';

import type { LinkSpec, OwnPropertySection, SchemaFieldSpec } from '../resourceDetail/props';


export type ResourceCreateHeaderProps = {
	titleLvl1?: SchemaFieldSpec,
	backLinkTitle?: LinkSpec,
};

/** Title overrides fall back to the values held in the resource-create context. */
export function ResourceCreateHeader(headerProps: ResourceCreateHeaderProps = {}): React.ReactNode {
	const { schemaPack } = useResourceDetailContext();
	const context = useResourceCreateContext();
	const titleLvl1 = headerProps.titleLvl1 ?? context.titleLvl1;
	const backLinkTitle = headerProps.backLinkTitle ?? context.backLinkTitle;
	const t = useTranslate(useResourceDetailTranslationNs());
	const localize = useLocalize(useResourceDetailTranslationNs());
	const tid = useResourceDetailTestAttrs();
	const modelSchema = schemaPack?.modelSchema;
	const resourceName = localize(modelSchema?.label, { count: 99 });
	const showBackLinkTitle = Boolean(backLinkTitle && modelSchema);

	return (
		<Group gap={4} justify='space-between' align='flex-start' wrap='nowrap' className='w-full'>
			<Stack gap={4}>
				{/*
				 * One row, `{link} > {title}`, matching `PageHeader`'s title row on the update page:
				 * both are the same page in the reader's mind, and stacking the link *under* the
				 * title here made the two look like different screens.
				 */}
				<Group gap='xs' align='center'>
					{showBackLinkTitle ? (
						<Anchor
							component={Link}
							to={backLinkTitle!.linkHref}
							relative='path'
							size='md'
							className='capitalize'
							{...tid('breadcrumb')}
						>
							{resourceName}
						</Anchor>
					) : null}
					{showBackLinkTitle && titleLvl1 ? <Text c='dimmed'>{'>'}</Text> : null}
					{titleLvl1 ? (
						<Title order={3}>
							<span className='capitalize'>{t('form.newResource', { resource: resourceName })}</span>
						</Title>
					) : null}
				</Group>
			</Stack>
			<SplitPaneCloseButton />
		</Group>
	);
}

/**
 * Save on its own, for a create form whose body is `createNodes`.
 *
 * `ResourceCreateActionBar` pairs Save with a collapse toggle because it sits in the header of the
 * one section it collapses. A `createNodes` body has no single section to toggle -- it may hold
 * several `collapsible_section`s, each with its own -- so this variant drops the toggle and keeps
 * only the button, reading the form runtime itself rather than being handed a click handler.
 */
export function ResourceCreateSaveBar(): React.ReactNode {
	const t = useTranslate(useResourceDetailTranslationNs());
	const { commands } = useResourceCreateContext();
	const createLock = useCreateLock();
	const tid = useResourceDetailTestAttrs();
	const formRuntime = useCrudFormRuntime();
	const isLoading = formRuntime?.isLoading ?? false;

	return (
		<Group gap='xs' align='center' className={clsx('sticky top-0 py-4', classes.bgBodyColor)}>
			<Button
				variant='filled'
				leftSection={<IconDeviceFloppy size={16} />}
				onClick={formRuntime ? formRuntime.handleSubmit() : () => undefined}
				disabled={isLoading}
				loading={isLoading}
				locked={createLock.locked}
				lockedMissing={createLock.missing}
				type='submit'
				{...commandAttrs(commands.create)}
				{...tid('action', 'save')}
			>
				{t('action.save')}
			</Button>
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
	const { commands } = useResourceCreateContext();
	const createLock = useCreateLock();
	const tid = useResourceDetailTestAttrs();
	return (
		<Group gap='xs' align='center' className={clsx('sticky top-0 py-4', classes.bgBodyColor)}>
			<ActionIcon
				variant='subtle' size='sm' onClick={onToggleCollapse} aria-label='Toggle own properties'
				{...tid('toggleOwnProperties')}
			>
				{expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
			</ActionIcon>
			<Button
				variant='filled'
				leftSection={<IconDeviceFloppy size={16} />}
				onClick={onSaveClick}
				disabled={isLoading}
				loading={isLoading}
				locked={createLock.locked}
				lockedMissing={createLock.missing}
				type='submit'
				{...commandAttrs(commands.create)}
				{...tid('action', 'save')}
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
	const { stableFieldLayout } = useDetailFieldDisplay();
	const t = useTranslate(useResourceDetailTranslationNs());
	const modelSchema = schemaPack?.modelSchema;

	// A header over nothing reads as a broken section, so a block whose fields all filter out is
	// dropped along with its title.
	if (!modelSchema || !isBlockVisible(modelSchema, block.fields ?? [], 'create', stableFieldLayout)) {
		return null;
	}

	return (
		<Stack gap='sm' className={clsx(classes.formBlock, formBlockSpanClass(block))}>
			{block.header && block.showTitle ? <Title order={4}>{t(block.header)}</Title> : null}
			<FieldGroupVertical
				fields={block.fields ?? []}
				isLoading={isLoading}
				modelSchema={modelSchema}
				fieldValues={NO_RECORD}
				mode='create'
			/>
		</Stack>
	);
}

const NO_RECORD: Record<string, unknown> = {};

/**
 * Locks Save on a create form. The way in is already gated, but `/{resource}/new` is a URL anyone
 * can type, and the form should say up front that it cannot be submitted.
 */
function useCreateLock() {
	return useActionLock(useResourceDetailSchemaName(), StandardActionCode.Create);
}
