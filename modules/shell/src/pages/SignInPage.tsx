import { useWindowTitle } from '@nikkierp/ui/breadcrumbs';
import { useTranslate } from '@nikkierp/ui/i18n';
import React from 'react';

import * as signIn from '../features/signIn/SignInPage';


export function SignInPage(): React.ReactNode {
	useWindowTitle(useTranslate('common')('action.signIn'));
	return <signIn.SignInPage />;
}
