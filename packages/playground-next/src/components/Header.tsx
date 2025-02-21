'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

const NavLink = ({ href, children }: NavLinkProps) => {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <Link
      href={href}
      className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm
        ${
          isActive
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
        }`}
    >
      {children}
    </Link>
  );
};

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-sm bg-white/80 border-b border-gray-200/80">
      <div className="container mx-auto px-4">
        <nav className="h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mr-4">
              Playground
            </span>
            <div className="flex items-center bg-gray-100/50 rounded-xl p-1.5 space-x-1">
              <NavLink href="/">Multichain</NavLink>
              <NavLink href="/sdk">SDK</NavLink>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};
