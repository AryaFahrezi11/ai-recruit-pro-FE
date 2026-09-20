import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Masuk ke Akun',
  description: 'Masuk ke akun AI Recruit Pro Anda untuk mulai melamar pekerjaan impian atau mengelola proses rekrutmen perusahaan secara cerdas.',
  openGraph: {
    title: 'Masuk ke Akun | AI Recruit Pro',
    description: 'Masuk ke akun AI Recruit Pro Anda untuk mulai melamar pekerjaan impian atau mengelola proses rekrutmen perusahaan secara cerdas.',
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
