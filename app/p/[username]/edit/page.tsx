/* eslint-disable @typescript-eslint/no-unused-vars */
import { Suspense } from 'react';
import EditProfileClient from '@/components/tools/socialbio/editprofile';

interface PageProps {
  params: { username: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function EditProfilePage({
  params,
  searchParams,
}: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditProfileClient username={params.username} />
    </Suspense>
  );
}
