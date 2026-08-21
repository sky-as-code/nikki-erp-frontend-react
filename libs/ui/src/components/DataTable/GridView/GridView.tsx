import { Anchor, Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import clsx from 'clsx';
import React from 'react';
import { Link, useResolvedPath } from 'react-router-dom';

import classes from './GridView.module.css';
import { getThumbnailInitials, resolveThumbnailField } from './thumbnail';
import { useTranslate } from '../../../i18n';
import { getCellText, getRowNumber, renderDataCellContent } from '../cellValues';
import sharedClasses from '../DataTable.module.css';
import { useDataTableContext } from '../DataTableContext';
import { rowTestIdOf } from '../testIds';

import type { RowId } from '../testIds';
import type { SearchItem } from '../types';


/**
 * The cards view: the same records the list shows, one card each.
 *
 * It renders from the very same context — the same page of items, the same `desired_fields`,
 * the same renderers and selection state — so switching views changes only the shape of the
 * body. What a card shows is what a row shows, laid out vertically: the first visible field
 * becomes the heading, the rest become label/value lines, and a picture is shown when the
 * record carries one.
 */
export function GridView(): React.ReactNode {
	const context = useDataTableContext();
	const searchData = context.tableSearchData;
	const selectedRows = context.rs.rows;
	const t = useTranslate('common');
	return (
		<div
			ref={context.containerRef}
			tabIndex={0}
			onKeyDown={context.handlers.onKeyDown}
			className='outline-none overflow-auto min-w-0 w-full max-w-full'
		>
			{searchData.items.length === 0 ? (
				<Text c='dimmed' size='sm' ta='center' py='xl'>{t('search.noResults')}</Text>
			) : (
				<SimpleGrid cols={context.settings.gridColumns} spacing='md' p='xs'>
					{searchData.items.map((item, rowIndex) => (
						<ItemCard
							key={item.id ?? rowIndex}
							item={item}
							rowIndex={rowIndex}
							isSelected={Boolean(selectedRows[rowIndex])}
						/>
					))}
				</SimpleGrid>
			)}
		</div>
	);
}

type ItemCardProps = {
	item: SearchItem,
	rowIndex: number,
	isSelected: boolean,
};

function ItemCard(props: ItemCardProps): React.ReactNode {
	const context = useDataTableContext();
	const { item, rowIndex, isSelected } = props;
	const searchData = context.tableSearchData;
	const rowMove = context.rowMove;
	const rowId = rowTestIdOf(item, rowIndex);
	const rowLink = context.settings.buildLinkHref?.(item);
	const fields = searchData.desired_fields;
	const [titleField, ...detailFields] = fields;
	const title = titleField ? getCellText(item, titleField, searchData.masked_fields) : '';
	const thumbnailField = resolveThumbnailField(
		item, fields, context.settings.modelSchema, context.settings.gridThumbnailField,
	);
	// A card is one target, so a click selects that record alone — the same thing clicking a
	// row's cell does in the list. The row-number handle a list uses for additive selection has
	// no place on a card, so drag-select and shift-range do not apply here.
	const onMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
		context.handlers.onDataCellMouseDown(
			event as unknown as React.MouseEvent<HTMLTableCellElement>,
			rowIndex,
		);
	};
	const showDropIndicator = rowMove.state.draggingIndex !== null && rowMove.state.dropIndex === rowIndex;
	const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		if (!context.settings.allowRowMovement) {
			return;
		}
		event.preventDefault();
		rowMove.dragOver(rowIndex);
	};

	return (
		<Card
			withBorder
			shadow='xs'
			radius='md'
			p='sm'
			h='100%'
			draggable={context.settings.allowRowMovement}
			onMouseDown={onMouseDown}
			onMouseEnter={() => context.handlers.onRowMouseEnter(rowIndex)}
			onDragStart={() => rowMove.startDragging(rowIndex)}
			onDragOver={onDragOver}
			onDrop={() => rowMove.drop(rowIndex)}
			onDragEnd={rowMove.cancel}
			className={clsx(classes.card, {
				[classes.cardSelected]: isSelected,
				[classes.cardDropIndicator]: showDropIndicator,
			})}
			{...context.tid.row(rowId)}
		>
			<Stack gap='xs'>
				<CardThumbnail
					item={item}
					thumbnailField={thumbnailField}
					title={title}
					rowNumber={getRowNumber(searchData.page, searchData.size, rowIndex)}
					rowId={rowId}
					rowIndex={rowIndex}
				/>
				{titleField ? (
					<CardTitle
						field={titleField}
						item={item}
						linkHref={rowLink}
						rowId={rowId}
						title={title}
					/>
				) : null}
				<Stack gap={2}>
					{detailFields.map(field => (
						<CardField key={field} field={field} item={item} rowId={rowId} />
					))}
				</Stack>
			</Stack>
		</Card>
	);
}

type CardThumbnailProps = {
	item: SearchItem,
	thumbnailField: string | null,
	title: string,
	rowNumber: number,
	rowId: RowId,
	rowIndex: number,
};

/**
 * The picture, with the record's row number overlaid as its selection handle.
 *
 * The number is the same one the list view puts in its leading column, so a record keeps one
 * identity across both views and a test can select it the same way in either.
 */
function CardThumbnail(props: CardThumbnailProps): React.ReactNode {
	const context = useDataTableContext();
	const imageUrl = props.thumbnailField ? String(props.item[props.thumbnailField]) : null;
	const [hasFailed, setHasFailed] = React.useState(false);

	React.useEffect(() => {
		setHasFailed(false);
	}, [imageUrl]);

	return (
		<div className={classes.thumbnail}>
			{imageUrl && !hasFailed ? (
				<img
					src={imageUrl}
					alt={props.title}
					loading='lazy'
					className={classes.thumbnailImage}
					onError={() => setHasFailed(true)}
				/>
			) : (
				<div className={classes.thumbnailPlaceholder} aria-hidden>
					{getThumbnailInitials(props.title)}
				</div>
			)}
			<button
				type='button'
				className={clsx(
					'absolute top-1 left-1 min-w-6 h-6 px-1.5 rounded border-none cursor-pointer',
					'text-xs bg-white/85 hover:bg-white',
				)}
				onMouseDown={e => context.handlers.onRowMouseDown(
					e as unknown as React.MouseEvent<HTMLButtonElement>, props.rowIndex,
				)}
				{...context.tid.rowSelect(props.rowId)}
			>
				{props.rowNumber}
			</button>
		</div>
	);
}

type CardTitleProps = {
	field: string,
	item: SearchItem,
	linkHref?: string,
	rowId: RowId,
	title: string,
};

function CardTitle(props: CardTitleProps): React.ReactNode {
	const context = useDataTableContext();
	const resolved = useResolvedPath(props.linkHref ?? '.');
	const content = useFieldContent(props.field, props.item);
	const body = (
		<Text fw={600} size='sm' lineClamp={2} title={props.title}>{content}</Text>
	);
	return (
		<div {...context.tid.rowCell(props.rowId, props.field)}>
			{props.linkHref ? (
				<Anchor
					component={Link}
					to={resolved.pathname}
					className={sharedClasses.rowLink}
					tabIndex={-1}
				>
					{body}
				</Anchor>
			) : body}
		</div>
	);
}

type CardFieldProps = {
	field: string,
	item: SearchItem,
	rowId: RowId,
};

function CardField(props: CardFieldProps): React.ReactNode {
	const context = useDataTableContext();
	const searchData = context.tableSearchData;
	const content = useFieldContent(props.field, props.item);
	const text = getCellText(props.item, props.field, searchData.masked_fields);
	return (
		<Group gap='xs' justify='space-between' wrap='nowrap' {...context.tid.rowCell(props.rowId, props.field)}>
			<Text size='xs' c='dimmed' className={classes.fieldLabel}>
				{context.settings.translateFieldName(props.field)}
			</Text>
			<Text size='xs' component='div' className={classes.fieldValue} title={text}>
				{content}
			</Text>
		</Group>
	);
}

/** Renders one field exactly as the list view's cell would — same renderer, same data type. */
function useFieldContent(field: string, item: SearchItem): React.ReactNode {
	const context = useDataTableContext();
	const t = useTranslate(context.settings.translationNs);
	const searchData = context.tableSearchData;
	const fieldSchema = context.settings.modelSchema?.fields[field];
	const fieldRenderer = context.settings.fieldRenderer?.[field];
	const rawValue = item[field];
	const value = getCellText(item, field, searchData.masked_fields);
	return React.useMemo(
		() => renderDataCellContent(rawValue, value, fieldSchema, fieldRenderer, t),
		[rawValue, value, fieldSchema, fieldRenderer, t],
	);
}
