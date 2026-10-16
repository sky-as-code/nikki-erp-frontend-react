import { useCrudFormRuntime } from '@nikkierp/ui/components/form';
import React from 'react';
import { useParams } from 'react-router';


/** Shared edit-mode state for a `resource_form` subtree (action bar <-> columns). */
export type ResourceFormViewContextValue = {
	updateMode: boolean,
	setUpdateMode: React.Dispatch<React.SetStateAction<boolean>>,
	/** Discards unsaved edits and returns to read mode. */
	cancelUpdate?: () => void,
};

const ResourceFormViewContext = React.createContext<ResourceFormViewContextValue | null>(null);

export type ResourceFormViewProviderProps = {
	value: ResourceFormViewContextValue,
	children: React.ReactNode,
};

export function ResourceFormViewProvider({ value, children }: ResourceFormViewProviderProps): React.ReactNode {
	return <ResourceFormViewContext.Provider value={value}>{children}</ResourceFormViewContext.Provider>;
}

export function useResourceFormView(): ResourceFormViewContextValue | null {
	return React.useContext(ResourceFormViewContext);
}

export type ResourceFormViewScopeProps = {
	updateMode: boolean,
	setUpdateMode: React.Dispatch<React.SetStateAction<boolean>>,
	children: React.ReactNode,
};

/**
 * Provides the edit-mode state together with `cancelUpdate`, and cancels an open update when the
 * routed record changes.
 *
 * The form is not remounted when the `:id` param changes (a split view's detail pane swaps records
 * in place), so without this the next record would open still in update mode, silently dropping
 * the previous record's edits. Must sit inside `CrudFormProvider`: cancelling resets the form.
 */
export function ResourceFormViewScope(props: ResourceFormViewScopeProps): React.ReactNode {
	const { updateMode, setUpdateMode, children } = props;
	const reset = useCrudFormRuntime()?.reset;
	const cancelUpdate = React.useCallback(() => {
		reset?.();
		setUpdateMode(false);
	}, [reset, setUpdateMode]);
	useCancelOnRecordChange(cancelUpdate);
	const value = React.useMemo(
		() => ({ updateMode, setUpdateMode, cancelUpdate }),
		[updateMode, setUpdateMode, cancelUpdate],
	);

	return <ResourceFormViewProvider value={value}>{children}</ResourceFormViewProvider>;
}

function useCancelOnRecordChange(cancelUpdate: () => void): void {
	const { id } = useParams();
	const previousId = React.useRef(id);

	// Keyed on the id, not on cancelUpdate's identity: a fresh callback alone must not cancel.
	React.useEffect(() => {
		if (previousId.current === id) return;
		previousId.current = id;
		cancelUpdate();
	}, [id, cancelUpdate]);
}
