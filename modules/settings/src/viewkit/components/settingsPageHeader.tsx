import { Text } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { Button } from '@nikkierp/ui/components';
import { useTranslate } from '@nikkierp/ui/i18n';
import { componentAttrs } from '@nikkierp/viewengine/core';
import { PageHeader } from '@nikkierp/viewkit-mantine';
import { IconDeviceFloppy } from '@tabler/icons-react';
import React from 'react';
import { z } from 'zod';

import { SETTINGS_PAGE_TITLE } from '../ids';
import { useSettingsPageContext } from '../pages/settingsPageContext';

import type { IComponentRenderer } from '@nikkierp/viewengine/core';


/**
 * The settings page header: the title, and below it the page's one Save, top-left, exactly where a
 * resource detail page keeps its Save.
 *
 * Registered under the title's contribution id because page metadata references that id; what it
 * renders grew from a title into the whole header.
 */
export const settingsPageTitleRenderer: IComponentRenderer<Record<string, never>> = {
	type: SETTINGS_PAGE_TITLE,
	propsSchema: z.object({}).strict(),
	render() {
		return <SettingsPageHeader />;
	},
};

function SettingsPageHeader(): React.ReactNode {
	const { params } = useSettingsPageContext();
	const t = useTranslate(params.translationNs);

	return (
		<PageHeader
			titleLvl1={{ text: t(params.titleKey) }}
			rowSpacing='md'
			actions={<SettingsSaveAction />}
			{...componentAttrs(SETTINGS_PAGE_TITLE)}
			{...testAttrs('settings.page')}
		/>
	);
}

/**
 * Save for whichever pane is active. Disabled until that pane reports an edit, locked on the grant
 * the pane computed for the levels its edits touch -- the pane knows which levels those are, the
 * page does not.
 */
function SettingsSaveAction(): React.ReactNode {
	const { params, saveState, requestSave } = useSettingsPageContext();
	const t = useTranslate(params.translationNs);

	return (
		<>
			<Button
				variant='filled'
				leftSection={<IconDeviceFloppy size={16} />}
				onClick={requestSave}
				disabled={!saveState?.dirty || saveState.saving}
				loading={saveState?.saving ?? false}
				locked={saveState?.locked ?? false}
				lockedMissing={saveState?.lockedMissing ?? []}
				{...testAttrs('settings.action', 'save')}
			>
				{t('page.save')}
			</Button>
			{saveState?.error ? <Text size='sm' c='red' {...testAttrs('settings.action', 'saveError')}>{saveState.error}</Text> : null}
		</>
	);
}
