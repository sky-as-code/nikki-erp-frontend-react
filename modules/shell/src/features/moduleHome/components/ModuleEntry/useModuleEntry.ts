import clsx from 'clsx';
import { useState } from 'react';

import classes from './ModuleEntry.module.css';

import type { ModuleCardItem } from '../../moduleHomeModel';


/**
 * Every entry opens its module, available or not. A module the user holds nothing in renders the
 * refusal in place at that URL (see `LazyModule` in ShellRoutes), so there is no other page to send
 * them to.
 */
export function useModuleEntry(module: ModuleCardItem, layoutClass?: string) {
	const [menuOpened, setMenuOpened] = useState(false);
	return {
		targetPath: `/${module.slug}`,
		menuOpened,
		setMenuOpened,
		wrapperClassName: clsx(
			classes.entry, layoutClass,
			menuOpened && classes.menuOpen,
			module.isUnavailable && classes.unavailable,
		),
	};
}
