import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className }: LogoProps) {
  return (
    <Link href="/" className={cn('flex items-center group', className)} style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <img 
        src="/mainlogo.png"
        alt="VidyaSangrah Logo"
        style={{
          height: 400,
          width: 200,
          objectFit: "contain"
        }}
      />
    </Link>
  );
}
