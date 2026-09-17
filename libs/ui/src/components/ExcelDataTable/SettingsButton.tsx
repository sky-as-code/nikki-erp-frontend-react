import { Tooltip } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import React from 'react';

import { useExcelDataTableContext } from './context';
import { SettingsModal } from './settings/SettingsModal';
import { useTranslate } from '../../i18n';
import { Button } from '../Button';


/** Opens the table settings modal (displayed columns, page size). */
export function SettingsButton() {
	const t = useTranslate('common');
	const { settings, tid } = useExcelDataTableContext();
	const label = t('datatable.viewSettings');
	return (
		<>
			<Tooltip label={label}>
				<Button aria-label={label} onClick={settings.open} {...tid.settingsOpen()}>
					<IconSettings size={16} />
				</Button>
			</Tooltip>
			<SettingsModal opened={settings.isOpen} onClose={settings.close} />
		</>
	);
}
