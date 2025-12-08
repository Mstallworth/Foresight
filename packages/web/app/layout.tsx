import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Foresight | Futures made tangible',
  description: 'Compose prompts and explore generated foresight artifacts without a 404.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
