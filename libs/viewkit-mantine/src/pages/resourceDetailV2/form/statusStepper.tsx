import { useTranslate } from '@nikkierp/ui/i18n';
import { IconArrowRight, IconBan, IconCheck, IconCircleCheckFilled } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';

import classes from './statusStepper.module.css';
import { useResourceDetailTranslationNs } from '../../resourceDetail/ResourceDetailProvider';

import type { StatusOption } from '../../resourceDetail/props';


type StepState = 'done' | 'current' | 'upcoming';

/**
 * A record's status flow: the linear steps, done ones checked and the current one highlighted in
 * the primary colour, arrows between them, then the alternative ends (Cancelled, …) apart from the flow. Inside a form
 * panel under 640px wide it shows a compact "Step x of y" instead (pure CSS, see the module).
 */
export function StatusStepper({ statuses, current }: {
	statuses: StatusOption[],
	current: string | null,
}): React.ReactNode {
	const t = useTranslate(useResourceDetailTranslationNs());
	const tc = useTranslate();
	if (statuses.length === 0) {
		return null;
	}
	const steps = statuses.filter(status => !status.alternativeEnd);
	const ends = statuses.filter(status => status.alternativeEnd);
	const currentIndex = steps.findIndex(status => status.value === current);
	const stateOf = (index: number): StepState => {
		if (index === currentIndex) {
			return 'current';
		}
		return index < currentIndex ? 'done' : 'upcoming';
	};

	return (
		<div className={classes.root}>
			<nav aria-label={tc('common:form.statusFlow', { defaultValue: 'Status' })} className={classes.full}>
				<ol className={classes.steps}>
					{steps.map((status, index) => (
						<Step key={status.value} label={t(status.label)} state={stateOf(index)} connector={index > 0} />
					))}
					{ends.map((status, index) => (
						<Step
							key={status.value} label={t(status.label)} state={status.value === current ? 'current' : 'upcoming'}
							separator={index === 0 && steps.length > 0} alternativeEnd
						/>
					))}
				</ol>
			</nav>
			<CompactStatus steps={steps} ends={ends} current={current} currentIndex={currentIndex} />
		</div>
	);
}

function Step({ label, state, connector, separator, alternativeEnd }: {
	label: string,
	state: StepState,
	connector?: boolean,
	separator?: boolean,
	alternativeEnd?: boolean,
}): React.ReactNode {
	return (
		<li
			className={clsx(classes.step, state === 'current' && classes.current)}
			aria-current={state === 'current' ? 'step' : undefined}
			data-current={state === 'current' ? 'true' : undefined}
		>
			{connector ? <IconArrowRight size={14} stroke={1.5} aria-hidden='true' className={classes.arrow} /> : null}
			{separator ? <span aria-hidden='true' className={classes.endSeparator} /> : null}
			<span className={classes.pill}>
				<StepIcon state={state} alternativeEnd={alternativeEnd} />
				{label}
			</span>
		</li>
	);
}

function StepIcon({ state, alternativeEnd }: { state: StepState, alternativeEnd?: boolean }): React.ReactNode {
	const className = state === 'current' ? classes.currentIcon : classes.mutedIcon;
	if (alternativeEnd) {
		return <IconBan size={14} aria-hidden='true' className={className} />;
	}
	if (state === 'current') {
		return <IconCircleCheckFilled size={14} aria-hidden='true' className={className} />;
	}
	return state === 'done' ? <IconCheck size={14} aria-hidden='true' className={className} /> : null;
}

/** "Step x of y · {status}" over a segmented bar; an alternative end shows only its own label. */
function CompactStatus({ steps, ends, current, currentIndex }: {
	steps: StatusOption[],
	ends: StatusOption[],
	current: string | null,
	currentIndex: number,
}): React.ReactNode {
	const t = useTranslate(useResourceDetailTranslationNs());
	const tc = useTranslate();
	const end = ends.find(status => status.value === current);
	if (end) {
		return (
			<div className={classes.compact}>
				<span className={classes.compactText}>
					<IconBan size={14} aria-hidden='true' className={classes.currentIcon} />
					{t(end.label)}
				</span>
			</div>
		);
	}
	if (currentIndex < 0) {
		return null;
	}
	const stepOf = tc('common:form.statusStepOf', {
		current: currentIndex + 1, total: steps.length, defaultValue: 'Step {{current}} of {{total}}',
	});
	return (
		<div className={classes.compact}>
			<span className={classes.compactText}>{`${stepOf} · ${t(steps[currentIndex].label)}`}</span>
			<span aria-hidden='true' className={classes.segments}>
				{steps.map((status, index) => (
					<span
						key={status.value} className={clsx(classes.segment, index <= currentIndex && classes.filled)}
					/>
				))}
			</span>
		</div>
	);
}
