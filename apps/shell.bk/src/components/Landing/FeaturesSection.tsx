import {IconGitBranch,
	IconTestPipe,
	IconServer,
	IconCode} from '@tabler/icons-react'

import classes from './FeatureSection.module.css'

interface FeatureCardProps {
	icon: React.ReactNode;
	title: string;
	description: string;
}

const FeatureCard = ({
	icon, title, description,
}: FeatureCardProps) => (
	<div className={classes.feature}>
		<div className={classes.featureIcon}>{icon}</div>
		<h3 className={classes.featureTitle}>{title}</h3>
		<p className={classes.featureDescription}>{description}</p>
	</div>
)

export function Features() {
	const features = [
		{
			icon: <IconGitBranch className='h-5 w-5' />,
			title: 'Modern Git Workflow',
			description:
				'Built-in support for GitHub Flow with automated branch protection, code review workflows, and merge queue management.',
		},
		{
			icon: <IconTestPipe className='h-5 w-5' />,
			title: 'Integrated Testing',
			description:
				'Automated testing pipeline with Jest and Playwright. Includes UI component testing, API integration tests, and end-to-end testing.',
		},
		{
			icon: <IconServer className='h-5 w-5' />,
			title: 'Full-Stack Type Safety',
			description:
				'End-to-end type safety with TypeScript and tRPC. Automatic type inference from database to frontend with Prisma and Zod validation.',
		},
		{
			icon: <IconCode className='h-5 w-5' />,
			title: 'Developer Experience',
			description:
				'Pre-configured ESLint, Prettier, and TypeScript. Hot reload, error overlay, and automatic import organization for rapid development.',
		},
	]

	return (
		<section className={classes.wrapper}>
			<h2 className={classes.title}>Built for Modern Development</h2>
			<p className={classes.description}>
				Enterprise-grade development workflow with built-in best practices and
				tools
			</p>

			<div className={classes.grid}>
				{features.map((feature, index) => (
					<FeatureCard key={index} {...feature} />
				))}
			</div>
		</section>
	)
}
