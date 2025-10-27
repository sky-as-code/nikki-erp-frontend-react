import { Container, Text, Card, Group, Button, List, ListItem, ThemeIcon, SimpleGrid } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

import classes from './PricingSection.module.css';

interface PlanFeature {
	text: string;
	included: boolean;
}

interface PricingPlan {
	name: string;
	price: string;
	description: string;
	features: PlanFeature[];
	highlighted?: boolean;
	buttonText: string;
}

function PricingCard({ plan }: { plan: PricingPlan }) {
	const {
		name, price, description, features, highlighted, buttonText,
	} = plan;

	return (
		<Card className={`${classes.card} ${highlighted ? classes.highlighted : ''}`} padding='xl'>
			<div className={classes.planHeader}>
				<Text fz='xl' fw={700} className={classes.planName}>
					{name}
				</Text>
				<Text fz='sm' c={highlighted ? 'white' : 'dimmed'} className={classes.planDescription}>
					{description}
				</Text>
			</div>

			<Group justify='center' className={classes.priceGroup}>
				<Text fz='xl' span fw={700}>
					$
				</Text>
				<Text fz='50' fw={700} span>
					{price}
				</Text>
				<Text fz='sm' c={highlighted ? 'white' : 'dimmed'} span>
					/month
				</Text>
			</Group>

			<List
				spacing='sm'
				size='sm'
				center
				className={classes.featuresList}
			>
				{features.map((feature, index) => (
					<ListItem
						key={index}
						icon={
							feature.included ? (
								<ThemeIcon
									size={20}
									radius='xl'
								>
									<IconCheck size={12} stroke={2.5} color='white' />
								</ThemeIcon>
							) : (
								<ThemeIcon
									size={20}
									radius='xl'
									color='gray.1'
								>
									<IconX size={12} stroke={2.5} color='black' />
								</ThemeIcon>
							)
						}
						className={feature.included ? '' : classes.disabledFeature}
					>
						{feature.text}
					</ListItem>
				))}
			</List>

			<Button
				fullWidth
				size='md'
				variant={highlighted ? 'white' : 'light'}
				className={classes.button}
			>
				{buttonText}
			</Button>
		</Card>
	);
}

export function PricingSection() {
	const plans: PricingPlan[] = [
		{
			name: 'Starter',
			price: '0',
			description: 'Perfect for side projects and small teams',
			buttonText: 'Get Started',
			features: [
				{ text: 'Up to 5 team members', included: true },
				{ text: 'Basic analytics', included: true },
				{ text: '24/7 email support', included: true },
				{ text: 'Community access', included: true },
				{ text: 'Custom domains', included: false },
				{ text: 'Advanced security', included: false },
			],
		},
		{
			name: 'Professional',
			price: '29',
			description: 'Ideal for growing businesses',
			buttonText: 'Start Free Trial',
			highlighted: true,
			features: [
				{ text: 'Up to 20 team members', included: true },
				{ text: 'Advanced analytics', included: true },
				{ text: 'Priority support', included: true },
				{ text: 'Community access', included: true },
				{ text: 'Custom domains', included: true },
				{ text: 'Advanced security', included: true },
			],
		},
		{
			name: 'Enterprise',
			price: '99',
			description: 'For large-scale applications',
			buttonText: 'Contact Sales',
			features: [
				{ text: 'Unlimited team members', included: true },
				{ text: 'Custom analytics', included: true },
				{ text: '24/7 phone support', included: true },
				{ text: 'Community access', included: true },
				{ text: 'Multiple domains', included: true },
				{ text: 'Enterprise security', included: true },
			],
		},
	];

	return (
		<Container size='lg' py={120}>
			<Text ta='center' fw={700} fz='48px' mb='sm'>
				Simple, transparent pricing
			</Text>
			<Text ta='center' c='dimmed' mb={50}>
				Choose the plan that best fits your needs
			</Text>

			<SimpleGrid cols={{
				base: 1, sm: 2, lg: 3,
			}} spacing='xl'>
				{plans.map((plan) => (
					<PricingCard key={plan.name} plan={plan} />
				))}
			</SimpleGrid>
		</Container>
	);
}
