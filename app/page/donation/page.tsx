import { getDonations, getSetup } from '../../lib/data';
import DonationClient from './DonationClient';
import { Metadata } from 'next';
import { getDictionary } from '../../lib/dictionary';
import { cookies } from 'next/headers';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || "id";
  const dict = getDictionary(locale);
  const setup = await getSetup();

  return {
    title: `${dict.common.donation} - ${setup.sitename}`,
    description: dict.common.donation_desc,
  };
}

export default async function DonationPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || "id";
  const dict = getDictionary(locale);
  
  const donationData = await getDonations();

  return <DonationClient donationData={donationData} dict={dict} />;
}
