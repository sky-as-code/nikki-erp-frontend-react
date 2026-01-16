import { resolvePath, useLocation, useNavigate } from 'react-router';


export function handleGoBack(navigate: ReturnType<typeof useNavigate>, location: ReturnType<typeof useLocation>) {
	navigate(resolvePath('..', location.pathname).pathname);
}
