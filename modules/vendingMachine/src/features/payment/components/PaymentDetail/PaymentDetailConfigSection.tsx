/* eslint-disable max-lines-per-function */
import {
	Badge,
	Box,
	Button,
	Group,
	Select,
	Stack,
	Table,
	Text,
	TextInput,
} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
	paymentConfigToRows,
	type PaymentConfigRow,
} from '@/features/payment/utils/paymentConfigRows';

import type { CustomFieldValueType, PaymentMethod } from '@/features/payment/types';


export interface PaymentDetailConfigSectionProps {
	mode: 'view' | 'edit';
	config: PaymentMethod['config'];
	configRows: PaymentConfigRow[];
	onConfigRowsChange: (rows: PaymentConfigRow[]) => void;
}

function renderStoredValue(valueType: CustomFieldValueType, value: string): string {
	if (valueType === 'password') {
		return '••••••••';
	}
	return value;
}

export const PaymentDetailConfigSection: React.FC<PaymentDetailConfigSectionProps> = ({
	mode,
	config,
	configRows,
	onConfigRowsChange,
}) => {
	const { t: translate } = useTranslation();
	const isReadOnly = mode === 'view';
	const rows = isReadOnly ? paymentConfigToRows(config) : configRows;

	const [newKey, setNewKey] = React.useState('');
	const [newValue, setNewValue] = React.useState('');
	const [newType, setNewType] = React.useState<CustomFieldValueType>('string');

	React.useEffect(() => {
		if (isReadOnly) {
			setNewKey('');
			setNewValue('');
			setNewType('string');
		}
	}, [isReadOnly]);

	const valueTypeOptions: Array<{ value: CustomFieldValueType; label: string }> = [
		{ value: 'string', label: translate('nikki.vendingMachine.payment.customFieldTypes.string') },
		{ value: 'number', label: translate('nikki.vendingMachine.payment.customFieldTypes.number') },
		{ value: 'password', label: translate('nikki.vendingMachine.payment.customFieldTypes.password') },
		{ value: 'email', label: translate('nikki.vendingMachine.payment.customFieldTypes.email') },
		{ value: 'url', label: translate('nikki.vendingMachine.payment.customFieldTypes.url') },
		{ value: 'date', label: translate('nikki.vendingMachine.payment.customFieldTypes.date') },
	];

	const handleAddRow = () => {
		if (isReadOnly || !newKey.trim() || !newValue.trim()) return;
		onConfigRowsChange([
			...configRows,
			{ key: newKey.trim(), value: newValue.trim(), valueType: newType },
		]);
		setNewKey('');
		setNewValue('');
		setNewType('string');
	};

	const handleRemoveRow = (index: number) => {
		if (isReadOnly) return;
		onConfigRowsChange(configRows.filter((_, i) => i !== index));
	};

	return (
		<Box>
			<Text size='sm' c='dimmed' mb={3} fw={500}>
				{translate('nikki.vendingMachine.payment.fields.customFields')}
			</Text>

			{rows.length > 0 && (
				<Table striped highlightOnHover mb='md'>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>{translate('nikki.vendingMachine.payment.fields.customFieldKey')}</Table.Th>
							<Table.Th>{translate('nikki.vendingMachine.payment.fields.customFieldValue')}</Table.Th>
							<Table.Th>{translate('nikki.vendingMachine.payment.fields.customFieldType')}</Table.Th>
							<Table.Th style={{ width: 50 }} />
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{rows.map((field, index) => (
							<Table.Tr key={`${field.key}-${index}`}>
								<Table.Td>{field.key}</Table.Td>
								<Table.Td>{renderStoredValue(field.valueType, field.value)}</Table.Td>
								<Table.Td>
									<Badge size='sm' variant='light'>
										{valueTypeOptions.find((o) => o.value === field.valueType)?.label
											|| field.valueType}
									</Badge>
								</Table.Td>
								<Table.Td>
									<Button
										variant='subtle'
										color='red'
										size='xs'
										disabled={isReadOnly}
										onClick={() => handleRemoveRow(index)}
										aria-label={translate('nikki.general.actions.delete')}
									>
										<IconTrash size={14} />
									</Button>
								</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			)}

			{rows.length === 0 && (
				<Text size='sm' c='dimmed' mb='sm'>
					{translate('nikki.vendingMachine.payment.messages.no_custom_fields')}
				</Text>
			)}

			<Stack gap='xs' mt={rows.length > 0 ? 'md' : 0}>
				<Group gap='xs' align='flex-end'>
					<TextInput
						placeholder={translate('nikki.vendingMachine.payment.fields.customFieldKey')}
						value={newKey}
						onChange={(e) => setNewKey(e.currentTarget.value)}
						readOnly={isReadOnly}
						style={{ flex: 1 }}
					/>
					<Select
						placeholder={translate('nikki.vendingMachine.payment.fields.customFieldType')}
						value={newType}
						onChange={(v) => setNewType((v || 'string') as CustomFieldValueType)}
						data={valueTypeOptions}
						disabled={isReadOnly}
						style={{ width: 150 }}
					/>
				</Group>
				<Group gap='xs' align='flex-end'>
					<TextInput
						placeholder={translate('nikki.vendingMachine.payment.fields.customFieldValue')}
						value={newValue}
						onChange={(e) => setNewValue(e.currentTarget.value)}
						type={newType === 'password' ? 'password' : newType === 'number' ? 'number' : 'text'}
						readOnly={isReadOnly}
						style={{ flex: 1 }}
					/>
					<Button
						onClick={handleAddRow}
						disabled={isReadOnly || !newKey.trim() || !newValue.trim()}
					>
						{translate('nikki.general.actions.add')}
					</Button>
				</Group>
			</Stack>
		</Box>
	);
};
