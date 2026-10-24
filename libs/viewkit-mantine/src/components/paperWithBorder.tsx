import { Paper } from '@mantine/core';
import clsx from 'clsx';
import React from 'react';

import classes from './paperWithBorder.module.css';

import type { PaperProps } from '@mantine/core';


/**
 * The bordered card every block in this kit sits on. Shared by the generic
 * `collapsible_section` and by the resource form's own sections, so it lives here rather
 * than in any one of them.
 *
 * Used as `<Stack component={PaperWithBorder}>`, so it must forward everything the Stack hands
 * it — the flex/gap class, style props such as `mb`, and the `componentAttrs` test ids — or the
 * caller's layout silently never reaches the DOM.
 *
 * Its padding and the gap below it follow density; a caller's `p`/`mb` style props still win.
 */
export function PaperWithBorder(
	{ className, ...rest }: PaperProps & React.ComponentPropsWithRef<'div'>,
): React.ReactNode {
	return <Paper withBorder {...rest} className={clsx(classes.sectionCard, className)} />;
}
