import { Badge, Group, Paper, Radio, Stack, Text } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { Button, LocalizedMoney, LocalizedNumber } from '@nikkierp/ui/components';
import React from 'react';

import { OUTCOME_COLORS } from './quoteView';
import { TEST_ID_MODULE } from '../salesText';

import type { ProgramView } from './quoteView';
import type { PromotionActions } from './usePromotionActions';
import type { SalesText } from '../salesText';


type ListProps = {
	programs: ProgramView[],
	actions: PromotionActions,
	text: SalesText,
	/** `update` on the order: reward choices and declines are its writes. */
	locked: boolean,
};

/** Read-only amounts: the engine computes every figure, the cashier only chooses (BR-T01). */
export function PromotionProgramList({ programs, ...rest }: ListProps): React.ReactNode {
	if (programs.length === 0) {
		return <Text size='sm' c='dimmed'>{rest.text.t('promotion.panel.no_programs')}</Text>;
	}
	return (
		<Stack gap='xs' {...testAttrs(TEST_ID_MODULE, 'orderPromotions', 'programs')}>
			{programs.map(program => <ProgramRow key={program.promotionId} program={program} {...rest} />)}
		</Stack>
	);
}

function ProgramRow({ program, actions, text, locked }: Omit<ListProps, 'programs'> & { program: ProgramView }) {
	return (
		<Paper withBorder p='xs' {...testAttrs(TEST_ID_MODULE, 'orderPromotions', 'program', program.promotionId)}>
			<Stack gap={4}>
				<Group justify='space-between' wrap='nowrap'>
					<Group gap='xs' wrap='nowrap'>
						<Text fw={600} size='sm'>{program.title}</Text>
						{program.voucherCode ? (
							<Badge variant='light' color='grape'>
								{text.t('promotion.panel.voucher_code', { code: program.voucherCode })}
							</Badge>
						) : null}
					</Group>
					<Badge color={OUTCOME_COLORS[program.outcome]}>{text.t(program.outcomeKey)}</Badge>
				</Group>
				{program.reasonKey ? <Text size='xs' c='dimmed'>{text.t(program.reasonKey)}</Text> : null}
				<ProgramBenefit program={program} text={text} />
				{program.canChoose ? (
					<RewardChoice program={program} actions={actions} text={text} locked={locked} />
				) : null}
				<GiftToggle program={program} actions={actions} text={text} locked={locked} />
			</Stack>
		</Paper>
	);
}

function ProgramBenefit({ program, text }: { program: ProgramView, text: SalesText }): React.ReactNode {
	if (!program.hasDiscount && !program.gift) {
		return null;
	}
	return (
		<Group gap='md'>
			{program.hasDiscount ? (
				<Text size='sm'>
					{text.t('promotion.panel.discount_total')}: <LocalizedMoney value={program.discountTotal} />
				</Text>
			) : null}
			{program.affectedLineCount > 0 ? (
				<Text size='xs' c='dimmed'>
					{text.t('promotion.panel.affected_lines')}: {program.affectedLineCount}
				</Text>
			) : null}
			{program.gift ? (
				<Text size='sm'>
					{text.t('promotion.panel.gift')}: <LocalizedNumber value={program.gift.quantity} />
				</Text>
			) : null}
		</Group>
	);
}

function RewardChoice({ program, actions, text, locked }: {
	program: ProgramView, actions: PromotionActions, text: SalesText, locked: boolean,
}): React.ReactNode {
	const selected = program.rewards.find(reward => reward.selected)?.rewardId ?? null;
	return (
		<Radio.Group
			label={text.t('promotion.panel.choose_reward')}
			value={selected}
			onChange={rewardId => void actions.selectReward(program.promotionId, rewardId)}
			{...testAttrs(TEST_ID_MODULE, 'orderPromotions', 'rewardChoice', program.promotionId)}
		>
			<Stack gap={4} mt={4}>
				{program.rewards.map(reward => (
					<Radio
						key={reward.rewardId}
						value={reward.rewardId}
						label={reward.label}
						disabled={locked || actions.pending}
						{...testAttrs(TEST_ID_MODULE, 'orderPromotions', 'reward', reward.rewardId)}
					/>
				))}
			</Stack>
		</Radio.Group>
	);
}

/** A gift can be refused; a refused one can be taken back by choosing its reward again. */
function GiftToggle({ program, actions, text, locked }: {
	program: ProgramView, actions: PromotionActions, text: SalesText, locked: boolean,
}): React.ReactNode {
	const giftReward = program.rewards[0];
	if (program.canDecline) {
		return (
			<Group>
				<Button
					variant='subtle'
					size='compact-sm'
					locked={locked}
					loading={actions.pending}
					onClick={() => void actions.decline(program.promotionId)}
					{...testAttrs(TEST_ID_MODULE, 'orderPromotions', 'decline', program.promotionId)}
				>
					{text.t('promotion.panel.decline_gift')}
				</Button>
			</Group>
		);
	}
	if (program.isDeclined && giftReward && !program.canChoose) {
		return (
			<Group>
				<Button
					variant='subtle'
					size='compact-sm'
					locked={locked}
					loading={actions.pending}
					onClick={() => void actions.selectReward(program.promotionId, giftReward.rewardId)}
					{...testAttrs(TEST_ID_MODULE, 'orderPromotions', 'accept', program.promotionId)}
				>
					{text.t('promotion.panel.accept_gift')}
				</Button>
			</Group>
		);
	}
	return null;
}
