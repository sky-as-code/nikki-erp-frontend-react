import { Cleaned, cleanFormData } from '@nikkierp/common/utils';
import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { useMicroAppDispatch } from '@nikkierp/ui/microApp';


export function useSubmit<TData extends object, TForm = UseFormReturn<TData>>({
	submitAction,
	validate,
}: {
	submitAction: (payload: TData) => any;
	validate?: (data: Cleaned<TData>, form?: TForm) => boolean;
}) {
	const dispatch = useMicroAppDispatch();

	return useCallback(
		(data: TData, form?: TForm) => {
			const cleanedData = cleanFormData(data) as TData;

			if (validate && !validate(cleanedData, form)) return;
			dispatch(submitAction(cleanedData));
		},
		[dispatch, submitAction, validate],
	);
}
