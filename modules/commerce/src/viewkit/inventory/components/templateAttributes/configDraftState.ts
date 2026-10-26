import { notifications } from '@mantine/notifications';
import { useCommand } from '@nikkierp/ui/hookhoc';
import { useResourceUpdateContext } from '@nikkierp/viewkit-mantine';
import React from 'react';

import { needsConfirmation } from './configPreview';
import { buildConfigContribution, configFromRecord, isEtagMismatch } from './templateConfigDrafts';
import { ProductTemplateCommands } from '../../../features/productTemplate/commands';

import type { ConfigPreview } from './configPreview';
import type { SentConfigRows, TemplateConfigDraft } from './templateConfigDrafts';
import type { ClientErrorItem } from '@nikkierp/common/types';
import type { DetailSavePayload } from '@nikkierp/viewkit-mantine';


/** The record the section edits, in update mode; `undefined` while creating. */
export type TemplateRecord = {
	id: string,
	etag: string,
	configuration: unknown,
	refresh: () => void,
};

/** The saved template, read off the update page: its configuration, etag and reload. */
export function useTemplateRecord(): TemplateRecord | undefined {
	const { resource, refresh } = useResourceUpdateContext();
	return React.useMemo((): TemplateRecord | undefined => (
		typeof resource?.id === 'string' && typeof resource.etag === 'string'
			? { id: resource.id, etag: resource.etag, configuration: resource.attribute_configuration, refresh }
			: undefined
	), [resource, refresh]);
}

/** A preview the user is asked to accept before the save goes out. */
export type PendingPreview = { preview: ConfigPreview, answer: (accepted: boolean) => void };

export type ConfigDraftState = {
	saved: TemplateConfigDraft,
	draft: TemplateConfigDraft,
	setDraft: (next: TemplateConfigDraft) => void,
	/** The rows behind the last contribution's lists, for mapping that request's errors. */
	sent: React.RefObject<SentConfigRows | null>,
	/** Rejections of the last preview; a save's own come from the page. */
	previewErrors: ClientErrorItem[],
	pending: PendingPreview | null,
	isPreviewing: boolean,
};

type Messages = { stale: string, previewFailed: string };

/**
 * The configuration being edited, contributed to the page's own create or update so the template
 * fields and its attribute lines save in ONE request. In update mode the save is gated on a preview:
 * when it changes a variant's identity or archives or deletes one, the user confirms first.
 */
export function useConfigDraftState(args: {
	record: TemplateRecord | undefined,
	save: DetailSavePayload,
	updateMode: boolean,
	messages: Messages,
}): ConfigDraftState {
	const { record, save, updateMode } = args;
	const configuration = record?.configuration;
	const saved = React.useMemo(() => configFromRecord(configuration), [configuration]);
	const [edited, setEdited] = React.useState<TemplateConfigDraft | null>(null);
	const draft = edited ?? saved;
	const sent = React.useRef<SentConfigRows | null>(null);
	const gate = usePreviewGate(record, args.messages);

	React.useEffect(() => {
		if (!updateMode) {
			setEdited(null);
		}
	}, [updateMode, record?.id]);

	useStaleSaveReload(save.saveClientErrors, record, args.messages.stale);
	useConfigContributor({
		saved, draft, save, sent,
		confirm: save.mode === 'update' ? gate.confirm : undefined,
		onSaved: () => setEdited(null),
	});
	return {
		saved, draft, setDraft: setEdited, sent,
		previewErrors: gate.previewErrors, pending: gate.pending, isPreviewing: gate.isPreviewing,
	};
}

function useConfigContributor(args: {
	saved: TemplateConfigDraft,
	draft: TemplateConfigDraft,
	save: DetailSavePayload,
	sent: React.RefObject<SentConfigRows | null>,
	confirm: ((request: Record<string, unknown>) => Promise<boolean>) | undefined,
	onSaved: () => void,
}): void {
	const { save, sent } = args;
	const register = save.register;
	const latest = React.useRef(args);

	React.useEffect(() => {
		latest.current = args;
	});

	React.useEffect(() => register?.({
		build: () => {
			const contribution = buildConfigContribution(latest.current.saved, latest.current.draft);
			sent.current = contribution?.sent ?? null;
			return contribution?.payload;
		},
		onSaved: () => latest.current.onSaved(),
		confirm: request => latest.current.confirm?.(request) ?? Promise.resolve(true),
	}), [register, sent]);
}

/** Runs the preview of the request about to go out, and asks the user when it is not harmless. */
function usePreviewGate(record: TemplateRecord | undefined, messages: Messages) {
	const previewCmd = useCommand<ConfigPreview>(ProductTemplateCommands.PREVIEW_ATTRIBUTE_CONFIGURATION);
	const publish = previewCmd.publish;
	const [pending, setPending] = React.useState<PendingPreview | null>(null);
	const [previewErrors, setPreviewErrors] = React.useState<ClientErrorItem[]>([]);
	const latest = React.useRef({ record, messages });
	latest.current = { record, messages };

	const confirm = React.useCallback(async (request: Record<string, unknown>): Promise<boolean> => {
		setPreviewErrors([]);
		const response = await publish({
			id: request.id, etag: request.etag,
			attribute_lines: request.attribute_lines, exclusions: request.exclusions,
		});
		const clientErrors = response.result?.clientErrors ?? [];
		if (isEtagMismatch(clientErrors)) {
			reloadStale(latest.current.record, latest.current.messages.stale);
			return false;
		}
		if (clientErrors.length > 0 || response.error != null || !response.result?.data) {
			setPreviewErrors(clientErrors);
			if (clientErrors.length === 0) {
				notifications.show({ color: 'red', message: latest.current.messages.previewFailed });
			}
			return false;
		}
		const preview = response.result.data;
		if (!needsConfirmation(preview)) {
			return true;
		}
		return new Promise<boolean>(resolve => setPending({
			preview,
			answer: accepted => {
				setPending(null);
				resolve(accepted);
			},
		}));
	}, [publish]);

	return { confirm, pending, previewErrors, isPreviewing: previewCmd.isPending };
}

/** A save refused because the template moved on reloads it, so the next preview runs against the new state. */
function useStaleSaveReload(saveClientErrors: ClientErrorItem[], record: TemplateRecord | undefined, message: string) {
	const latest = React.useRef({ record, message });
	latest.current = { record, message };
	React.useEffect(() => {
		if (isEtagMismatch(saveClientErrors)) {
			reloadStale(latest.current.record, latest.current.message);
		}
	}, [saveClientErrors]);
}

function reloadStale(record: TemplateRecord | undefined, message: string): void {
	record?.refresh();
	notifications.show({ color: 'orange', message });
}
