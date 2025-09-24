import { Footer } from '@/components/Footer';
import { CTASection } from '@/components/Landing/CTASection';
import { FAQSection } from '@/components/Landing/FAQSection';
import { Features } from '@/components/Landing/FeaturesSection';
import { Header } from '@/components/Landing/Header';
import { HeroSection } from '@/components/Landing/HeroSection';
import { LandingContainer } from '@/components/Landing/LandingContainer';
import { PricingSection } from '@/components/Landing/PricingSection';
import { SocialProofSection } from '@/components/Landing/SocialProofSection';
import { useMantineColorScheme } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react';

export const Route = createFileRoute('/')({
  component: LandingPage
})


function LandingPage() {
	const {  setColorScheme } = useMantineColorScheme();

	useEffect(() => {
		setColorScheme('light');
	}, []);

	const headerLinks = [
		{
			link: '/about',
			label: 'Home',
		},
		{
			link: '/learn',
			label: 'Features',
		},
		{
			link: '/pricing',
			label: 'Pricing',
		},
	];
	
	return (
		<LandingContainer>
			<Header links={headerLinks}/>
			<HeroSection />
			<SocialProofSection />
			<Features />
			<PricingSection />
			<FAQSection />
			<CTASection />
			<Footer />
		</LandingContainer>
	);
}