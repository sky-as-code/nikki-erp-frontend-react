import { useCrudFormRuntime } from '@nikkierp/ui/components/form';
import { useTranslate } from '@nikkierp/ui/i18n';
import React from 'react';

import { publishServerErrors } from './publishServerErrors';
import { useResourceDetailTranslationNs } from './ResourceDetailProvider';

import type { RegisterAfterSave, RegisterFileField, RegisterUpdatePayload } from './afterSave';
import type { LinkSpec, ResourceDetailStandardActionCommands, SchemaFieldSpec } from './props';
import type { ClientErrorItem } from '@nikkierp/common/types';
import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/** Attaches field-scoped rejections to the mounted form; the form runtime's `setServerErrors`. */
export type ServerErrorSink = (clientErrors: ClientErrorItem[]) => ClientErrorItem[];

export type ResourceCreateContextValue = {
	commands: ResourceDetailStandardActionCommands,
	titleLvl1?: SchemaFieldSpec,
	backLinkTitle?: LinkSpec,
	/** The create form's body. See `createNodes` in `props.ts`. */
	createNodes?: ComponentNode[],
	onSubmit: (data: Record<string, any>) => void,
	isSubmitting: boolean,
	registerAfterSave: RegisterAfterSave,
	/** A file field's staged edit, sent in the create request itself (multipart when a file is chosen). */
	registerFileField: RegisterFileField,
	/**
	 * v2 only: adds keys to the create request itself, for a section whose rows must be created in
	 * the same write as the record (e.g. an attribute's values). Same contract as the update one.
	 */
	registerCreatePayload?: RegisterUpdatePayload,
	/** v2 only: the last create's rejections, for a section that maps its own rows' errors. */
	saveClientErrors?: ClientErrorItem[],
	/**
	 * Lets the mounted create form receive a create's field rejections: the submit runs in the
	 * provider, above `CrudFormProvider`, so it cannot reach `setServerErrors` itself. Returns the
	 * unbind function. See {@link BindCreateServerErrors}.
	 */
	bindServerErrorSink: (sink: ServerErrorSink) => () => void,
};

export const ResourceCreateContext = React.createContext<ResourceCreateContextValue | undefined>(undefined);

export function useResourceCreateContext(): ResourceCreateContextValue {
	const value = React.useContext(ResourceCreateContext);
	if (value === undefined) {
		throw new Error('useResourceCreateContext must be used within ResourceCreate');
	}
	return value;
}

/** For a module's own section that serves both form modes: `undefined` outside a create form. */
export function useOptionalResourceCreateContext(): ResourceCreateContextValue | undefined {
	return React.useContext(ResourceCreateContext);
}

/**
 * The create provider's side of the server-error routing: `routeServerErrors` publishes the
 * non-field rejections to the Shell Notice stack and hands the field ones to the bound form.
 */
export function useCreateServerErrors(): {
	bindServerErrorSink: ResourceCreateContextValue['bindServerErrorSink'],
	routeServerErrors: (clientErrors: ClientErrorItem[]) => void,
} {
	const t = useTranslate(useResourceDetailTranslationNs());
	const sinkRef = React.useRef<ServerErrorSink | null>(null);
	const bindServerErrorSink = React.useCallback((sink: ServerErrorSink) => {
		sinkRef.current = sink;
		return () => {
			if (sinkRef.current === sink) {
				sinkRef.current = null;
			}
		};
	}, []);
	const routeServerErrors = React.useCallback((clientErrors: ClientErrorItem[]) => {
		sinkRef.current?.(publishServerErrors(t, clientErrors));
	}, [t]);
	return { bindServerErrorSink, routeServerErrors };
}

/** Render inside the create form's `CrudFormProvider` to bind its runtime as the error sink. */
export function BindCreateServerErrors(): null {
	const { bindServerErrorSink } = useResourceCreateContext();
	const setServerErrors = useCrudFormRuntime()?.setServerErrors;
	React.useEffect(
		() => (setServerErrors ? bindServerErrorSink(setServerErrors) : undefined),
		[bindServerErrorSink, setServerErrors],
	);
	return null;
}
