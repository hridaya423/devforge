import { Suspense } from 'react';
import EditProfileClient from '@/components/tools/socialbio/editprofile';

type PageProps = {
  params: { username: string };
}

export default function EditProfilePage({ params }: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditProfileClient username={params.username} />
    </Suspense>
  );
}
