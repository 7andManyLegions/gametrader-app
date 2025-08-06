// This component is a Server Component by default, which is the correct pattern.
import ListingDetailClient from './ListingDetailClient';

type PageProps = {
  params: { id: string };
};

export default function ListingDetailPage({ params }: PageProps) {
  return <ListingDetailClient id={params.id} />;
}