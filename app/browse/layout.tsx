'use client';

import { DatabaseProvider } from '@/contexts/databaseContext';

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DatabaseProvider>{children}</DatabaseProvider>;
}
