/* eslint-disable max-lines-per-function */
import {
	Badge,
	Box, Button, Divider, Group, Image, Select, Stack, Table, Text, TextInput,
} from '@mantine/core';
import { IconCreditCard, IconPlus, IconTrash } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { ArchivedStatusBadge } from '@/components/ArchivedStatusBadge';
import { DetailControlPanel } from '@/components/ControlPanel';
import { PageContainer } from '@/components/PageContainer';
import { usePaymentDetail } from '@/features/payment';
import { CustomFieldValueType } from '@/features/payment/types';


export const PaymentDetailPage: React.FC = () => {
	const { t: translate } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const { payment, isLoading } = usePaymentDetail(id);
	const [customFields, setCustomFields] = useState<any[]>([]);
	const [newFieldKey, setNewFieldKey] = useState('');
	const [newFieldValue, setNewFieldValue] = useState('');
	const [newFieldType, setNewFieldType] = useState<CustomFieldValueType>('string');

	React.useEffect(() => {
		if (payment) {
			// setCustomFields(payment.customFields || []);
		}
	}, [payment]);

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

	const renderCustomFieldValue = (field: any) => {
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

	const breadcrumbs = [
		{ title: translate('nikki.vendingMachine.title'), href: '../overview' },
		{ title: translate('nikki.vendingMachine.payment.title'), href: '../payment' },
		{ title: payment?.name || translate('nikki.vendingMachine.payment.detail.title'), href: '#' },
	];

	if (isLoading || !payment) {
		return (
			<PageContainer
				breadcrumbs={breadcrumbs}
				actionBar={<div />}
			>
				<Text c='dimmed'>{translate('nikki.general.messages.loading')}</Text>
			</PageContainer>
		);
	}

	return (
		<PageContainer
			breadcrumbs={breadcrumbs}
			actionBar={<DetailControlPanel
				onSave={() => {}}
				onGoBack={() => {}}
				onDelete={() => {}}
			/>}
		>
			<Stack gap='md'>
				<Group gap='xs' mb='md'>
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
					<ArchivedStatusBadge isArchived={payment.isArchived} />
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
		</PageContainer>
	);
};
