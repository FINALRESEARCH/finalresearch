import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CALL',
};

export default function CallLayout({ children }: { children: React.ReactNode }) {
  return children;
}
