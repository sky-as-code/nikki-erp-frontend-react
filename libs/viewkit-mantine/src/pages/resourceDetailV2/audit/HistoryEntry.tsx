import { Avatar, Group, Stack, Text } from '@mantine/core';
import { storageFileUrlOf } from '@nikkierp/common/request';
import { formatLocalizedDateTime, useFormatLocale } from '@nikkierp/ui/components';
import { MaskedCellLock, maskedFieldMissing } from '@nikkierp/ui/components/ExcelDataTable';
import { schemaModuleName, useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import React from 'react';

import classes from './AuditLayout.module.css';
import { formatHistoryTime, historyEntryContent } from './historyEntries';
import { capitalizeFirst, formatEdgeValue, historyFieldLabel, historyRelationOf } from './historyLabels';
import { renderDisplayFieldValue } from '../../../components/fieldValue';
import {
	useResourceDetailContext, useResourceDetailTestAttrs, useResourceDetailTranslationNs,
} from '../../resourceDetail/ResourceDetailProvider';
import { useDetailFieldDisplay } from '../detailFieldDisplay';

import type * as dyn from '@nikkierp/common/dynamicModel';
import type { ResourceHistoryChange, ResourceHistoryItem } from '@nikkierp/common/service';


const HistoryRelatedSchemasContext = React.createContext<Record<string, dyn.ModelSchema>>({});

/** The schemas the record's edges point at, which name an edge change ("Roles"). Loaded by the History tab. */
export const HistoryRelatedSchemasProvider = HistoryRelatedSchemasContext.Provider;

/** One logged action: who and when, then its message or its `old → new (Field)` lines. */
export function HistoryEntry({ item }: { item: ResourceHistoryItem }): React.ReactNode {
	const tid = useResourceDetailTestAttrs();
	const content = historyEntryContent(item);
	return (
		<Group gap='sm' align='flex-start' wrap='nowrap' {...tid('auditEntry', item.id)} data-action={item.action}>
			<ActorAvatar item={item} />
			<Stack gap={2} className='min-w-0 flex-1'>
				<ActorLine item={item} />
				{content.messageKey ? (
					<EntryMessage messageKey={content.messageKey} customAction={content.customAction} />
				) : null}
				{content.showChanges ? (
					<ul className={classes.changeList}>
						{item.changes.map(change => (
							<HistoryChangeLine key={change.field} change={change} maskedFields={item.masked_fields} />
						))}
					</ul>
				) : null}
			</Stack>
		</Group>
	);
}

function useActorName(item: ResourceHistoryItem): string {
	const t = useTranslate('common');
	return item.actor.display_name || t(`audit.actor.${item.actor.type}`);
}

function ActorAvatar({ item }: { item: ResourceHistoryItem }): React.ReactNode {
	const name = useActorName(item);
	return (
		<Avatar src={storageFileUrlOf(item.actor.avatar_file_id)} name={name} color='initials' size='sm' radius='xl' />
	);
}

function ActorLine({ item }: { item: ResourceHistoryItem }): React.ReactNode {
	const name = useActorName(item);
	const locale = useFormatLocale();
	return (
		<Group gap='xs' wrap='nowrap' className='min-w-0'>
			<Text size='sm' fw={600} truncate>{name}</Text>
			<Text size='xs' c='dimmed' title={formatLocalizedDateTime(item.created_at, locale)}>
				{formatHistoryTime(item.created_at, locale)}
			</Text>
		</Group>
	);
}

function EntryMessage({ messageKey, customAction }: { messageKey: string, customAction?: string }): React.ReactNode {
	const t = useTranslate('common');
	const tPage = useTranslate(useResourceDetailTranslationNs());
	const localize = useLocalize(useResourceDetailTranslationNs());
	const { schemaPack } = useResourceDetailContext();
	// Singular: a schema label is a pluralized key (`iam_user.label_one` / `_other`), which the bare
	// key does not resolve. The sentence starts with it in English, so its first letter is raised.
	const resource = localize(schemaPack?.modelSchema?.label, { count: 1 }) || schemaPack?.schemaName || '';
	const action = customAction ? actionLabel(tPage, customAction) : undefined;
	return <Text size='sm'>{capitalizeFirst(t(messageKey, { resource, action }))}</Text>;
}

/** The page's own label of a custom action (`action.suspend`), else its code: a missing key reads `ns:key`. */
function actionLabel(tPage: (key: string) => string, code: string): string {
	const key = `action.${code}`;
	const label = tPage(key);
	return label && !label.endsWith(key) ? label : code;
}

function HistoryChangeLine({ change, maskedFields }: {
	change: ResourceHistoryChange,
	maskedFields?: string[],
}): React.ReactNode {
	const modelSchema = useResourceDetailContext().schemaPack?.modelSchema;
	const fieldLabel = historyFieldLabel({
		field: change.field,
		schema: modelSchema,
		localize: useLocalize(useResourceDetailTranslationNs()),
		localizeAny: useLocalize(),
		relatedSchemas: React.useContext(HistoryRelatedSchemasContext),
		moduleOf: schemaModuleName,
	});
	const tid = useResourceDetailTestAttrs();
	const masked = (maskedFields ?? []).includes(change.field);
	return (
		<li className={classes.changeLine} {...tid('auditChange', change.field)}>
			{masked ? (
				<MaskedCellLock missing={maskedFieldMissing(modelSchema, change.field, maskedFields) ?? []} />
			) : (
				<ChangeValues change={change} />
			)}
			<Text span size='sm' c='dimmed'>{` (${fieldLabel})`}</Text>
		</li>
	);
}

/** Old and new as the read form shows them; an edge's ids as their records' labels ("Role A, Role B"). */
function ChangeValues({ change }: { change: ResourceHistoryChange }): React.ReactNode {
	const localize = useLocalize(useResourceDetailTranslationNs());
	const modelSchema = useResourceDetailContext().schemaPack?.modelSchema;
	const fieldSchema = modelSchema?.fields[change.field];
	const renderer = useDetailFieldDisplay().fieldRenderers?.[change.field];
	const isEdge = Boolean(change.labels) || historyRelationOf(modelSchema, change.field) !== undefined;
	const render = (value: unknown) => (isEdge
		? formatEdgeValue(value, change.labels)
		: renderDisplayFieldValue(value, fieldSchema, localize, renderer));
	return (
		<Text span size='sm'>
			<Text span size='sm' c='dimmed'>{render(change.old)}</Text>
			{' → '}
			{render(change.new)}
		</Text>
	);
}
