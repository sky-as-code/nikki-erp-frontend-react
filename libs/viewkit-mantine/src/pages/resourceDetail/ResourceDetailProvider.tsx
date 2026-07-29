import { Alert, Text } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import { isLocalEnv } from '@nikkierp/common/utils';
import { useTranslate } from '@nikkierp/ui/i18n';
import { IconAlertCircle } from '@tabler/icons-react';
import React from 'react';



export type ResourceDetailContextValue = {
	translationNs: string,
	schemaPack: dyn.SchemaPack | null,
	isReading: boolean,
	isWriting: boolean,
};

const ResourceDetailContext = React.createContext<ResourceDetailContextValue | undefined>(undefined);

export type ResourceDetailProviderProps = ResourceDetailContextValue & {
	children: React.ReactNode,
};

export function ResourceDetailProvider({
	translationNs, schemaPack, isReading, isWriting, children,
}: ResourceDetailProviderProps): React.ReactNode {
	const value = React.useMemo(
		(): ResourceDetailContextValue => ({
			translationNs,
			schemaPack,
			isReading,
			isWriting,
		}),
		[translationNs, schemaPack, isReading, isWriting],
	);

	return (
		<ResourceDetailContext.Provider value={value}>
			{children}
		</ResourceDetailContext.Provider>
	);
}

export function useResourceDetailContext(): ResourceDetailContextValue {
	const value = React.useContext(ResourceDetailContext);
	if (value === undefined) {
		throw new Error('useResourceDetailContext must be used within ResourceDetailProvider');
	}
	return value;
}

export function useResourceDetailTranslationNs(): string {
	return useResourceDetailContext().translationNs;
}

export function DebugFormErrors(props: {errors: Record<string, unknown>}): React.ReactNode {
	const t = useTranslate(useResourceDetailTranslationNs());
	const hasErrors = Object.keys(props.errors).length > 0;
	const errs = Object.fromEntries(Object.entries(props.errors).map(([key, value]) => {
		delete (value as any)['ref'];
		return [key, value];
	}));

	return isLocalEnv() && hasErrors && (
		<Alert variant='outline' color='red' title={t('debug.form_errors')} icon={<IconAlertCircle />}>
			<Text>{JSON.stringify(errs)}</Text>
		</Alert>
	);
}

export function printDebugFormValues(values: any): any {
	isLocalEnv() && console.log('Form values:', values);
	return values;
}