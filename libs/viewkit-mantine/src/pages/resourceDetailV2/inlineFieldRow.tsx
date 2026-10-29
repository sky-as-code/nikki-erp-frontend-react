import { Group, Text } from '@mantine/core';
import { useTranslate } from '@nikkierp/ui/i18n';
import React from 'react';

import classes from './ResourceDetail.module.css';
import { parseInlineRowItem } from '../resourceDetail/formColumnFields';
import { useResourceDetailTranslationNs } from '../resourceDetail/ResourceDetailProvider';


/**
 * One nested `fields` entry of a form column, laid out as a single line: translated text,
 * literal text and field inputs (or values, in read mode) side by side. A row whose fields all
 * render nothing is dropped, text included, so no sentence is left without its subject.
 */
export function InlineFieldRow({ items, renderField }: {
	items: readonly string[],
	renderField: (field: string) => React.ReactNode,
}): React.ReactNode {
	const t = useTranslate(useResourceDetailTranslationNs());
	const parsed = items.map(parseInlineRowItem);
	const fieldNodes = parsed.map(item => (item.kind === 'field' ? renderField(item.name) : null));
	const fieldCount = parsed.filter(item => item.kind === 'field').length;
	if (fieldCount > 0 && fieldNodes.every(node => node === null)) {
		return null;
	}
	return (
		<Group gap='xs' align='center' wrap='wrap' className={classes.inlineFieldRow} data-testid='resourceForm.inlineRow'>
			{parsed.map((item, index) => {
				if (item.kind === 'field') {
					return <React.Fragment key={index}>{fieldNodes[index]}</React.Fragment>;
				}
				const text = item.kind === 'text' ? t(item.key, item.ns ? { ns: item.ns } : undefined) : item.text;
				return <Text key={index} size='md' component='span'>{text}</Text>;
			})}
		</Group>
	);
}
