import React from 'react';

type Props = Readonly<{
  children: React.ReactNode;
}>;

export default function AppFooter({ children }: Props) {
  return (
    <footer className={`
      border-t border-muted px-8 py-8 text-muted-foreground
      md:px-16
      xl:px-24
    `}
    >
      {children}
    </footer>
  );
}
