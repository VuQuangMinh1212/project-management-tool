'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { enhancedTokenStorage } from '@/lib/auth/enhanced-token-storage';
import { tokenRefreshService } from '@/lib/auth/token-refresh';
import { isTokenExpired } from '@/lib/utils/jwt';

const PUBLIC_ROUTES = ['/login', '/register', '/'];

export function TokenRefreshGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      if (PUBLIC_ROUTES.includes(pathname)) {
        return;
      }

      const accessToken = enhancedTokenStorage.getAccessToken();
      
      if (!accessToken) {
        router.push('/login');
        return;
      }

      if (isTokenExpired(accessToken)) {
        const newToken = await tokenRefreshService.refreshAccessToken();
        
        if (!newToken) {
          router.push('/login');
        }
      }
    };

    checkAndRefreshToken();

    const interval = setInterval(() => {
      checkAndRefreshToken();
    }, 60000);

    return () => clearInterval(interval);
  }, [pathname, router]);

  return <>{children}</>;
}
