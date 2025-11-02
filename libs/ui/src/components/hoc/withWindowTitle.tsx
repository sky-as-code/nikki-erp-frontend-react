import React from 'react';


export function withWindowTitle<T>(title: string, Component: React.ComponentType<T>): React.FC<T> {
	return (props: T) => {
		React.useEffect(() => {
			document.title = title;
		}, [title]);
		return React.createElement(Component as any, props as any);
	};
}