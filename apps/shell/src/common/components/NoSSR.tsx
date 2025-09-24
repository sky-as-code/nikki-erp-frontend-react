import { FC, PropsWithChildren, useState, useEffect } from 'react';

// Fix NextJS bug (Error: Hydration failed because the server rendered HTML didn't match the client)
// when it insists in rendering this component on serverside while the component is explicitly marked as clientside component.
export const NoSSR: FC<PropsWithChildren> = ({ children }) => {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	return children;
};
