import { LandingAbout } from '@/components/landing/landing-about';
import { LandingBenefitsBar } from '@/components/landing/landing-benefits-bar';
import { LandingBooking } from '@/components/landing/landing-booking';
import { LandingContact } from '@/components/landing/landing-contact';
import { LandingFinalCta } from '@/components/landing/landing-final-cta';
import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingHeader } from '@/components/landing/landing-header';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingMobileNav } from '@/components/landing/landing-mobile-nav';
import { LandingServices } from '@/components/landing/landing-services';
import { LandingWhyUs } from '@/components/landing/landing-why-us';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title:
		'Veterinaria San Roque | Clínica, Cirugía y Urgencias 24/7 en San Salvador',
	description:
		'Atención médica veterinaria integral con quirófano especializado, laboratorio clínico automatizado y expediente digital 24/7 en San Salvador.',
};

export default function Page() {
	return (
		<div className="flex min-h-screen flex-col">
			<LandingHeader />
			<main className="flex-grow">
				<LandingHero />
				<LandingBenefitsBar />
				<LandingServices />
				<LandingWhyUs />
				<LandingBooking />
				<LandingAbout />
				<LandingContact />
				<LandingFinalCta />
			</main>
			<LandingFooter />
			<LandingMobileNav />
		</div>
	);
}
