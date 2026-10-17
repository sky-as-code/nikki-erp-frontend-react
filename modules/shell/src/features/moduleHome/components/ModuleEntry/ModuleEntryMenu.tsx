import { ActionIcon, Menu } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { useTranslate } from '@nikkierp/ui/i18n';
import { IconDots } from '@tabler/icons-react';
import clsx from 'clsx';
import { FC } from 'react';
import { useHref } from 'react-router';

import classes from './ModuleEntry.module.css';

import type { ModuleCardItem } from '../../moduleHomeModel';


export type ModuleEntryMenuProps = {
	module: ModuleCardItem,
	targetPath: string,
	/** `shell.moduleCard` or `shell.moduleRow`; the slug and element are appended. */
	testIdPrefix: string,
	opened: boolean,
	onChange: (opened: boolean) => void,
	className?: string,
};

/** Temporarily hides the option button in both views; set to true to bring it back. */
const MODULE_OPTION_BUTTON_ENABLED = false;

/**
 * A sibling of the entry's anchor, never inside it: a button nested in an `<a>` lets the click
 * reach the link, which navigated instead of opening the menu.
 *
 * Favorite and disable are not offered: the backend has no toggle for either.
 */
export const ModuleEntryMenu: FC<ModuleEntryMenuProps> = ({
	module, targetPath, testIdPrefix, opened, onChange, className,
}) => {
	const translate = useTranslate('common');
	const href = useHref(targetPath);

	if (!MODULE_OPTION_BUTTON_ENABLED) {
		return null;
	}

	return (
		<Menu withinPortal shadow='sm' width={200} position='bottom-end' opened={opened} onChange={onChange}>
			<Menu.Target>
				<ActionIcon
					variant='default' size='sm'
					className={clsx(classes.menuButton, className)}
					aria-label={translate('module.actions', { module: module.name })}
					{...testAttrs(testIdPrefix, module.slug, 'actionMenu')}
				>
					<IconDots size={16} />
				</ActionIcon>
			</Menu.Target>

			<Menu.Dropdown>
				<Menu.Item
					component='a' href={href} target='_blank' rel='noopener noreferrer'
					{...testAttrs(testIdPrefix, module.slug, 'openInNewTab')}
				>
					{translate('module.openInNewTab')}
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
};
