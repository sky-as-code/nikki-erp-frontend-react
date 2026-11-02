import { ActionIcon, Box, Code, Popover, Text } from '@mantine/core';
import { IconHelpCircle } from '@tabler/icons-react';
import React from 'react';

import { strftimeDirectiveExamples } from './formatPatternExamples';
import { useTranslate } from '../../i18n';


/** Read mode of a format field: the stored pattern and what it prints, `%d/%m/%Y → 01/11/2026`. */
export function FormatPatternValue({ pattern, example }: { pattern: string, example: string | null }) {
	return (
		<span>
			<Code>{pattern}</Code>
			{example === null ? null : <Text span size='sm'>{' → '}{example}</Text>}
		</span>
	);
}

/** The live example under a format input; announced politely as the pattern changes. */
export function FormatPatternExample({ example }: { example: string | null }) {
	return (
		<Text size='xs' c='dimmed' mt={4} aria-live='polite' data-testid='formatPattern.example'>
			{example === null ? ' ' : `→ ${example}`}
		</Text>
	);
}

/** A help button listing the strftime directives a format may use, each with what it prints today. */
export function StrftimeHelpButton({ locale }: { locale: string }) {
	const t = useTranslate('common');
	const examples = strftimeDirectiveExamples(locale, new Date());
	return (
		<Popover position='bottom-end' withArrow shadow='md'>
			<Popover.Target>
				<ActionIcon
					variant='subtle' color='gray' aria-label={t('format_pattern.directives_help')}
					data-testid='formatPattern.help'
				>
					<IconHelpCircle size={16} />
				</ActionIcon>
			</Popover.Target>
			<Popover.Dropdown>
				<Text size='sm' fw={600} mb='xs'>{t('format_pattern.directives_title')}</Text>
				<Box component='dl' className='m-0 grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-0.5'>
					{examples.map(({ directive, example }) => (
						<React.Fragment key={directive}>
							<Box component='dt'><Code>{directive}</Code></Box>
							<Text component='dd' size='sm' m={0}>{example}</Text>
						</React.Fragment>
					))}
				</Box>
			</Popover.Dropdown>
		</Popover>
	);
}
