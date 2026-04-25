import { Button, Group as MantineGroup, Paper, Stack } from '@mantine/core';
import { ConfirmModal } from '@nikkierp/ui/components';
import { IconArrowLeft, IconCheck, IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';


export type FormLayoutActionButton = {
	key: string;
	label: React.ReactNode;
	icon?: React.ReactNode;
	onClick: () => void;
	variant?: 'filled' | 'outline' | 'light' | 'default' | 'subtle' | 'transparent';
	color?: string;
	disabled?: boolean;
	loading?: boolean;
	type?: 'button' | 'submit' | 'reset';
};

export type FormLayoutActions = {
	showBack?: boolean;
	backLabel?: React.ReactNode;
	onBack?: () => void;

	showSave?: boolean;
	saveLabel?: React.ReactNode;
	disableSave?: boolean;
	isSaving?: boolean;

	showDelete?: boolean;
	deleteLabel?: React.ReactNode;
	disableDelete?: boolean;
	onDelete?: () => void;
	deleteConfirm?: {
		title?: React.ReactNode;
		message?: React.ReactNode;
		confirmLabel?: React.ReactNode;
	};

	extraButtons?: FormLayoutActionButton[];
};

export type FormLayoutRenderApi = {
	setActions: (
		actions: FormLayoutActions | ((prev: FormLayoutActions) => FormLayoutActions),
	) => void;
};

export type FormLayoutProps = {
	children: (api: FormLayoutRenderApi) => React.ReactNode;
};

const DEFAULT_ACTIONS: FormLayoutActions = {
	showBack: true,
	showSave: true,
	showDelete: false,
};

/**
 * A re-usable form layout that provides a paper container with an action
 * toolbar (back / save / delete / extras). Actions are registered by the
 * children renderer, which receives a `setActions` API so it can toggle or
 * add buttons based on form state.
 *
 * Usage:
 * ```tsx
 * <FormLayout>
 *   {(api) => <MyFormBody api={api} />}
 * </FormLayout>
 * ```
 *
 * `MyFormBody` should call `api.setActions(...)` inside a `useEffect` to
 * (re-)register the currently available actions whenever inputs change.
 */
export function FormLayout({ children }: FormLayoutProps): React.ReactElement {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [actions, setActions] = React.useState<FormLayoutActions>(DEFAULT_ACTIONS);
	const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

	// Stable api object so consumers can use it as a stable dep
	const api = React.useMemo<FormLayoutRenderApi>(() => ({ setActions }), []);

	const handleBack = () => {
		if (actions.onBack) {
			actions.onBack();
			return;
		}
		navigate(-1);
	};

	const handleDeleteClick = () => {
		if (!actions.onDelete) return;
		if (actions.deleteConfirm) {
			setShowDeleteConfirm(true);
			return;
		}
		actions.onDelete();
	};

	const handleConfirmDelete = () => {
		setShowDeleteConfirm(false);
		actions.onDelete?.();
	};

	const extraButtons = actions.extraButtons ?? [];

	return (
		<>
			<Paper withBorder p='xl'>
				<Stack gap='xl'>
					<MantineGroup>
						{actions.showBack !== false && (
							<Button
								leftSection={<IconArrowLeft size={16} />}
								size='sm'
								variant='outline'
								onClick={handleBack}
								type='button'
							>
								{actions.backLabel ?? t('nikki.identity.group.actions.back')}
							</Button>
						)}
						{actions.showSave !== false && (
							<Button
								leftSection={<IconCheck size={16} />}
								size='sm'
								variant='filled'
								type='submit'
								disabled={actions.disableSave}
								loading={actions.isSaving}
							>
								{actions.saveLabel ?? t('nikki.identity.group.actions.save')}
							</Button>
						)}
						{actions.showDelete && actions.onDelete && (
							<Button
								leftSection={<IconTrash size={16} />}
								size='sm'
								variant='outline'
								color='red'
								onClick={handleDeleteClick}
								disabled={actions.disableDelete}
								type='button'
							>
								{actions.deleteLabel ?? t('nikki.identity.group.actions.delete')}
							</Button>
						)}
						{extraButtons.map((btn) => (
							<Button
								key={btn.key}
								leftSection={btn.icon}
								onClick={btn.onClick}
								disabled={btn.disabled}
								loading={btn.loading}
								variant={btn.variant ?? 'outline'}
								color={btn.color}
								size='sm'
								type={btn.type ?? 'button'}
							>
								{btn.label}
							</Button>
						))}
					</MantineGroup>
					{children(api)}
				</Stack>
			</Paper>

			{actions.deleteConfirm && (
				<ConfirmModal
					opened={showDeleteConfirm}
					onClose={() => setShowDeleteConfirm(false)}
					onConfirm={handleConfirmDelete}
					title={actions.deleteConfirm.title ?? ''}
					message={actions.deleteConfirm.message}
					confirmLabel={actions.deleteConfirm.confirmLabel}
					confirmColor='red'
				/>
			)}
		</>
	);
}
