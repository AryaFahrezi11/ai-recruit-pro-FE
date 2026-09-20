import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daftar Akun Baru',
  description: 'Daftar sekarang di AI Recruit Pro. Buka peluang karier impian bagi pencari kerja atau temukan talenta terbaik dengan seleksi AI cepat untuk perusahaan.',
  openGraph: {
    title: 'Daftar Akun Baru | AI Recruit Pro',
    description: 'Daftar sekarang di AI Recruit Pro. Buka peluang karier impian bagi pencari kerja atau temukan talenta terbaik dengan seleksi AI cepat untuk perusahaan.',
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
