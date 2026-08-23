import React from 'react';
import { Link } from 'react-router-dom';

import { Button } from './Button';

import type { ButtonProps } from './Button';


export type LinkButtonProps = Omit<ButtonProps<typeof Link>, 'component' | 'relative'> & {
	relative?: 'path' | 'route',
};

/**
 * A {@link Button} that navigates instead of firing a handler.
 *
 * Router links have to render as a real `<a>` to stay middle-clickable, so this drives Mantine's
 * polymorphic `component` prop rather than nesting a button inside a link. `relative='path'` is the
 * default because callers pass path-relative targets — a bare `'roles'` from a resource page means
 * "the roles page under this record", not a route-relative jump.
 */
export function LinkButton({ relative = 'path', ...rest }: LinkButtonProps): React.ReactElement {
	return <Button component={Link} relative={relative} {...rest} />;
}
