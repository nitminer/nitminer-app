import PricingComponent from '@/components/PricingComponent';
import Header from '@/components/Header';

export const metadata = {
  title: 'Pricing - NIT Miner',
  description: 'Choose the perfect plan for your needs. Simple, transparent pricing.'
};

export default function PricingPage() {
  return (
    <>
      <Header />
      <PricingComponent />
    </>
  );
}
