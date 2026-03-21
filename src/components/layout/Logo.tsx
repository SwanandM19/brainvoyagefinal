import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-7 h-7', text: 'text-base' },
    md: { icon: 'w-9 h-9', text: 'text-xl'  },
    lg: { icon: 'w-12 h-12', text: 'text-3xl' },
  };

  return (
    <Link href="/" className={cn('flex items-center gap-2.5 group', className)}>
      <div
        className={cn(
          sizes[size].icon,
          'bg-[#f97316] rounded-lg flex items-center justify-center text-white flex-shrink-0',
          'group-hover:bg-[#ea580c] transition-colors duration-200'
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4/6 h-4/6"
        >
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      </div>
      <span className={cn('font-extrabold tracking-tight', sizes[size].text)}>
        VIDYA<span style={{ color: '#f97316' }}>SANGAM</span>
      </span>
    </Link>
  );
}
