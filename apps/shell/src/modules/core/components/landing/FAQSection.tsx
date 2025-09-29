import { Container, Title, Text, Accordion, AccordionItem, AccordionControl, AccordionPanel } from '@mantine/core'

import classes from './FAQSection.module.css'

interface FAQItem {
	question: string;
	answer: string;
}

export function FAQSection() {
	const faqs: FAQItem[] = [
		{
			question: 'How does the free trial work?',
			answer: "We offer a 14-day free trial on our Professional plan. You'll get full access to all features during the trial period, and you can cancel anytime. No credit card required to start.",
		},
		{
			question: 'Can I change my plan later?',
			answer: "Yes, you can upgrade or downgrade your plan at any time. When you upgrade, you'll be charged the prorated difference. When you downgrade, you'll receive credit for the remaining time.",
		},
		{
			question: 'What payment methods do you accept?',
			answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual enterprise plans. All payments are processed securely through our payment providers.',
		},
		{
			question: 'Is there a long-term contract?',
			answer: 'No, all our plans are month-to-month unless you choose annual billing. You can cancel your subscription at any time without any cancellation fees.',
		},
		{
			question: 'Do you offer custom enterprise solutions?',
			answer: 'Yes, we offer customized enterprise solutions with dedicated support, custom integrations, and flexible pricing based on your specific needs. Contact our sales team to learn more.',
		},
		{
			question: 'What kind of support do you provide?',
			answer: 'We provide 24/7 email support for all plans. Professional plans include priority support, while Enterprise plans get dedicated support with phone and video call options.',
		},
	]

	return (
		<Container size='lg' py={120}>
			<Title ta='center' className={classes.title}>
				Frequently Asked Questions
			</Title>
			<Text c='dimmed' ta='center' mb={50}>
				Everything you need to know about our services
			</Text>

			<Accordion
				variant='separated'
				radius='md'
				className={classes.accordion}
				classNames={{
					item: classes.item,
					control: classes.control,
					panel: classes.panel,
				}}
			>
				{faqs.map((faq, index) => (
					<AccordionItem key={index} value={`faq-${index}`}>
						<AccordionControl>{faq.question}</AccordionControl>
						<AccordionPanel>{faq.answer}</AccordionPanel>
					</AccordionItem>
				))}
			</Accordion>
		</Container>
	)
}
