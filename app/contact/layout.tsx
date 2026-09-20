import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hubungi Kami',
  description: 'Punya pertanyaan atau butuh bantuan terkait platform AI Recruit Pro? Hubungi tim support kami, kami siap membantu Anda kapan saja.',
  openGraph: {
    title: 'Hubungi Kami | AI Recruit Pro',
    description: 'Punya pertanyaan atau butuh bantuan terkait platform AI Recruit Pro? Hubungi tim support kami, kami siap membantu Anda kapan saja.',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
