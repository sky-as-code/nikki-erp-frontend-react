import {
	Badge, Box, Button, Divider, Drawer, Group, Image, Select, Stack, Table, Text, TextInput,
} from '@mantine/core';
import { IconCreditCard, IconPlus, IconTrash } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CustomFieldValueType, PaymentMethod, PaymentMethodCustomField } from '../../types';


export interface PaymentDetailDrawerProps {
	opened: boolean;
	onClose: () => void;
	payment: PaymentMethod | undefined;
	isLoading?: boolean;
}

// eslint-disable-next-line max-lines-per-function
export const PaymentDetailDrawer: React.FC<PaymentDetailDrawerProps> = ({
	opened,
	onClose,
	payment,
	isLoading = false,
}) => {
	const { t: translate } = useTranslation();
	const [customFields, setCustomFields] = useState<PaymentMethodCustomField[]>(payment?.customFields || []);
	const [newFieldKey, setNewFieldKey] = useState('');
	const [newFieldValue, setNewFieldValue] = useState('');
	const [newFieldType, setNewFieldType] = useState<CustomFieldValueType>('string');

	React.useEffect(() => {
		if (payment) {
			setCustomFields(payment.customFields || []);
		}
	}, [payment]);

	if (isLoading || !payment) {
		return (
			<Drawer
				opened={opened}
				onClose={onClose}
				position='right'
				size='lg'
				title={<Text fw={600} size='lg'>{translate('nikki.vendingMachine.payment.detail.title')}</Text>}
			>
				<Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>
			</Drawer>
		);
	}

	const getStatusBadge = (status: string) => {
		const statusMap: Record<string, { color: string; label: string }> = {
			active: { color: 'green', label: translate('nikki.general.status.active') },
			inactive: { color: 'gray', label: translate('nikki.general.status.inactive') },
		};
		const statusInfo = statusMap[status] || { color: 'gray', label: status };
		return <Badge color={statusInfo.color}>{statusInfo.label}</Badge>;
	};

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
	};

	const handleAddCustomField = () => {
		if (newFieldKey.trim() && newFieldValue.trim()) {
			setCustomFields([...customFields, {
				key: newFieldKey.trim(),
				value: newFieldValue.trim(),
				valueType: newFieldType,
			}]);
			setNewFieldKey('');
			setNewFieldValue('');
			setNewFieldType('string');
		}
	};

	const handleRemoveCustomField = (index: number) => {
		setCustomFields(customFields.filter((_, i) => i !== index));
	};

	const renderCustomFieldValue = (field: PaymentMethodCustomField) => {
		switch (field.valueType) {
			case 'password':
				return '••••••••';
			default:
				return field.value;
		}
	};

	const valueTypeOptions: Array<{ value: CustomFieldValueType; label: string }> = [
		{ value: 'string', label: translate('nikki.vendingMachine.payment.customFieldTypes.string') },
		{ value: 'number', label: translate('nikki.vendingMachine.payment.customFieldTypes.number') },
		{ value: 'password', label: translate('nikki.vendingMachine.payment.customFieldTypes.password') },
		{ value: 'email', label: translate('nikki.vendingMachine.payment.customFieldTypes.email') },
		{ value: 'url', label: translate('nikki.vendingMachine.payment.customFieldTypes.url') },
		{ value: 'date', label: translate('nikki.vendingMachine.payment.customFieldTypes.date') },
	];

	return (
		<Drawer
			opened={opened}
			onClose={onClose}
			position='right'
			size='lg'
			title={
				<Group gap='xs'>
					{payment.image ? (
						<Box w={64} h={64}>
							<Image
								src={payment.image as string}
								alt={String(payment.name || '')}
								width={64}
								height={64}
								radius='sm'
								style={{ objectFit: 'contain' }}
							/>
						</Box>
					) : (
						<IconCreditCard size={26} stroke={1.5} />
					)}
					<Text fw={600} size='lg'>{payment.name}</Text>
				</Group>
			}
			overlayProps={{ opacity: 0.5, blur: 4 }}
		>
			<Stack gap='md'>
				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.payment.fields.code')}
					</Text>
					<Text size='sm' fw={500}>{payment.code}</Text>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.payment.fields.name')}
					</Text>
					<Text size='sm'>{payment.name}</Text>
				</div>

				{payment.image && (
					<>
						<Divider />
						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.payment.fields.image')}
							</Text>
							<Box w={64} h={64}>
								<Image
									src={payment.image as string}
									alt={String(payment.name || '')}
									width={64}
									height={64}
									radius='sm'
									style={{ objectFit: 'contain' }}
								/>
							</Box>
						</div>
					</>
				)}

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.payment.fields.status')}
					</Text>
					{getStatusBadge(payment.status)}
				</div>

				{payment.description && (
					<>
						<Divider />
						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.payment.fields.description')}
							</Text>
							<div
								dangerouslySetInnerHTML={{ __html: payment.description }}
								style={{
									fontSize: '0.875rem',
									lineHeight: 1.6,
								}}
							/>
						</div>
					</>
				)}

				{(payment.minTransactionValue !== undefined || payment.maxTransactionValue !== undefined) && (
					<>
						<Divider />
						<div>
							<Text size='sm' c='dimmed' mb='xs'>
								{translate('nikki.vendingMachine.payment.fields.transactionRange')}
							</Text>
							<Text size='sm'>
								{payment.minTransactionValue !== undefined
									? formatCurrency(payment.minTransactionValue)
									: '0'} - {payment.maxTransactionValue !== undefined
									? formatCurrency(payment.maxTransactionValue)
									: '∞'}
							</Text>
						</div>
					</>
				)}

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs' fw={500}>
						{translate('nikki.vendingMachine.payment.fields.customFields')}
					</Text>
					{customFields.length > 0 ? (
						<Table striped highlightOnHover>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>{translate('nikki.vendingMachine.payment.fields.customFieldKey')}</Table.Th>
									<Table.Th>{translate('nikki.vendingMachine.payment.fields.customFieldValue')}</Table.Th>
									<Table.Th>{translate('nikki.vendingMachine.payment.fields.customFieldType')}</Table.Th>
									<Table.Th style={{ width: 50 }}></Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{customFields.map((field, index) => (
									<Table.Tr key={index}>
										<Table.Td>{field.key}</Table.Td>
										<Table.Td>{renderCustomFieldValue(field)}</Table.Td>
										<Table.Td>
											<Badge size='sm' variant='light'>
												{valueTypeOptions.find(
													(opt) => opt.value === field.valueType)?.label || field.valueType}
											</Badge>
										</Table.Td>
										<Table.Td>
											<Button
												variant='subtle'
												color='red'
												size='xs'
												onClick={() => handleRemoveCustomField(index)}
											>
												<IconTrash size={14} />
											</Button>
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					) : (
						<Text size='sm' c='dimmed'>{translate('nikki.vendingMachine.payment.messages.no_custom_fields')}</Text>
					)}

					<Stack gap='xs' mt='md'>
						<Group gap='xs' align='flex-end'>
							<TextInput
								placeholder={translate('nikki.vendingMachine.payment.fields.customFieldKey')}
								value={newFieldKey}
								onChange={(e) => setNewFieldKey(e.currentTarget.value)}
								style={{ flex: 1 }}
							/>
							<Select
								placeholder={translate('nikki.vendingMachine.payment.fields.customFieldType')}
								value={newFieldType}
								onChange={(value) => setNewFieldType(value as CustomFieldValueType)}
								data={valueTypeOptions}
								style={{ width: 150 }}
							/>
						</Group>
						<Group gap='xs' align='flex-end'>
							<TextInput
								placeholder={translate('nikki.vendingMachine.payment.fields.customFieldValue')}
								value={newFieldValue}
								onChange={(e) => setNewFieldValue(e.currentTarget.value)}
								type={newFieldType === 'password' ? 'password' : newFieldType === 'number' ? 'number' : 'text'}
								style={{ flex: 1 }}
							/>
							<Button
								leftSection={<IconPlus size={16} />}
								onClick={handleAddCustomField}
								disabled={!newFieldKey.trim() || !newFieldValue.trim()}
							>
								{translate('nikki.general.actions.add')}
							</Button>
						</Group>
					</Stack>
				</div>

				<Divider />

				<div>
					<Text size='sm' c='dimmed' mb='xs'>
						{translate('nikki.vendingMachine.payment.fields.createdAt')}
					</Text>
					<Text size='sm'>{new Date(payment.createdAt).toLocaleString()}</Text>
				</div>
			</Stack>
		</Drawer>
	);
};
