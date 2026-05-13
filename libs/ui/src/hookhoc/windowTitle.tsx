import { useEffect } from 'react';

import { useTranslate } from '../i18n';


export function useWindowTitleI18n(titleKey: string, moduleName: string = 'common'): void {
	const translate = useTranslate(moduleName);

	useEffect(() => {
		document.title = translate(titleKey);
	}, [translate, titleKey]);
}

export function useWindowTitle(title: string): void {
	useEffect(() => {
		document.title = title;
	}, [title]);
}

export function withWindowTitleI18n<T extends object>(Component: React.ComponentType<T>, titleKey: string, moduleName: string = 'common'): React.FC<T> {
	return (props: T) => {
		useWindowTitleI18n(titleKey, moduleName);
		return <Component {...props} />;
	};
}

export function withWindowTitle<T extends object>(Component: React.ComponentType<T>, title: string): React.FC<T> {
	return (props: T) => {
		useWindowTitle(title);
		return <Component {...props} />;
	};
}