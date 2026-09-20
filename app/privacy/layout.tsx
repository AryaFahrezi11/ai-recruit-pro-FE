import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description: 'Komitmen AI Recruit Pro dalam menjaga kerahasiaan dan keamanan data pribadi pelamar serta mitra perusahaan sesuai standar keamanan siber.',
  openGraph: {
    title: 'Kebijakan Privasi | AI Recruit Pro',
    description: 'Komitmen AI Recruit Pro dalam menjaga kerahasiaan dan keamanan data pribadi pelamar serta mitra perusahaan sesuai standar keamanan siber.',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
