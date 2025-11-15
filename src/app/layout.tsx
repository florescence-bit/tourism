import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'RAH - Indian Tourist Safety App',
  description: 'Your personal safety companion',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-black text-white">
        {children}
      </body>
    </html>
  );
}
