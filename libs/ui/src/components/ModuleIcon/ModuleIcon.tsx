import { Image, ImageProps } from '@mantine/core';
import { ReactNode, useEffect, useState } from 'react';

import { GENERIC_MODULE_ICON_URL, getModuleIconUrl } from './moduleIconUrl';


export type ModuleIconProps = Omit<ImageProps, 'src'> & {
	/** Backend module name, as `InCodeModule.Name()` returns it. */
	name: string | undefined | null,
	alt?: string,
};

export function ModuleIcon({ name, alt, ...imageProps }: ModuleIconProps): ReactNode {
	const [src, setSrc] = useState(() => getModuleIconUrl(name));

	useEffect(() => {
		setSrc(getModuleIconUrl(name));
	}, [name]);

	return (
		<Image
			fit='contain' bg='transparent'
			{...imageProps}
			src={src} alt={alt ?? name ?? ''}
			onError={() => setSrc(GENERIC_MODULE_ICON_URL)}
		/>
	);
}
