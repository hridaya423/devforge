import { Suspense } from 'react';
import EditProfileClient from '@/components/tools/socialbio/editprofile';

export default async function EditProfilePage({
  params
}: {
  params: { username: string }
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditProfileClient username={params.username} />
    </Suspense>
  );
}
