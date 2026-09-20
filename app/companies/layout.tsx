import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daftar Perusahaan Terpercaya',
  description: 'Jelajahi profil perusahaan terkemuka dan startup terbaik di Indonesia. Temukan info budaya kerja, ulasan, dan lowongan aktif di AI Recruit Pro.',
  openGraph: {
    title: 'Daftar Perusahaan Terpercaya | AI Recruit Pro',
    description: 'Jelajahi profil perusahaan terkemuka dan startup terbaik di Indonesia. Temukan info budaya kerja, ulasan, dan lowongan aktif di AI Recruit Pro.',
  },
};

export default function CompaniesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
