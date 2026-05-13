import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

import * as svc from './moduleService';
import { SLICE_NAME, ModuleState } from './moduleSlice';

import type { RootState } from '../appState/store';


const selectModuleState = (state: RootState) => state[SLICE_NAME as keyof RootState] as ModuleState;

export function useSearchModules(throwOnError = false) {
	return svc.searchModules.useHook(useSelector, throwOnError);
}

export function useListAllModules(throwOnError = false) {
	return svc.listAllModules.useHook(useSelector, throwOnError);
}

const selectListAllModules = createSelector(
	svc.listAllModules.selector,
	(state) => ({
		hasData: state.isDone,
		data: state.data?.items ?? [],
	}),
);
export const useAllModules = () => useSelector(selectListAllModules);

const selectListAllModuleNames = createSelector(
	svc.listAllModules.selector,
	(state) => ({
		hasData: state.isDone,
		data: (state.data?.items ?? []).map((module) => module.name),
	}),
);
export const useAllModuleNames = () => useSelector(selectListAllModuleNames);
