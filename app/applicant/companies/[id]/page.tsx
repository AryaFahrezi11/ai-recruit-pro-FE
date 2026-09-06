import GlintsExactCompanyDetailPage from '../../../companies/[id]/page';

export default function ApplicantCompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <GlintsExactCompanyDetailPage params={params} />;
}
