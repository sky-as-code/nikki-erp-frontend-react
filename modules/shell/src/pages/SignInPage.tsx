import { useDocumentTitle } from '@nikkierp/ui/hooks';

import * as signIn from '../features/signIn/SignInPage';


export const SignInPage = () => {
	useDocumentTitle('nikki.shell.signIn.title', 'Sign In');
	return (
		<signIn.SignInPage />
	);
};
