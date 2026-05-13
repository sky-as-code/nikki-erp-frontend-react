import { withWindowTitleI18n } from '@nikkierp/ui/hookhoc';

import * as signIn from '../features/signIn/SignInPage';


export const SignInPage = withWindowTitleI18n(signIn.SignInPage, 'action.signIn');
