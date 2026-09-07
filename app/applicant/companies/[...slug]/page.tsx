import GlintsExactCompanyDetailPage from '../../../companies/[...slug]/page';

export default function ApplicantCompanyDetailPage({ params }: { params: Promise<{ slug: string[] }> }) {
  return <GlintsExactCompanyDetailPage params={params} />;
}
