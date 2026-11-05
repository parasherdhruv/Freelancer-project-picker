import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Autonomous Job Hunter',
  description: 'Discover and evaluate engineering opportunities and freelance contracts with an autonomous agent.',
  openGraph: {
    title: 'Autonomous Job Hunter',
    description: 'Discover and evaluate engineering opportunities and freelance contracts with an autonomous agent.',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
