import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan',
  description: 'Syarat dan ketentuan penggunaan layanan platform AI Recruit Pro untuk pelamar, perusahaan, dan mitra institusi.',
  openGraph: {
    title: 'Syarat & Ketentuan | AI Recruit Pro',
    description: 'Syarat dan ketentuan penggunaan layanan platform AI Recruit Pro untuk pelamar, perusahaan, dan mitra institusi.',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
