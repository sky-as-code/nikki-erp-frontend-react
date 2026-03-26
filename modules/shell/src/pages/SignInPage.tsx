import { useDocumentTitle } from '@nikkierp/ui/hooks';

import * as signIn from '../features/signIn/SignInPage';


export const SignInPage = () => {
	useDocumentTitle('nikki.shell.signIn.signIn', 'Sign In');
	return (
		<signIn.SignInPage />
	);
};
