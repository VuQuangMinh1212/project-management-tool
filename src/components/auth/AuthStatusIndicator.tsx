import { useEffect, useState } from "react";
import { enhancedTokenStorage } from "@/lib/auth/enhanced-token-storage";
import { Badge } from "@/components/ui/badge";

export function AuthStatusIndicator() {
  const [isRemembered, setIsRemembered] = useState(false);

  useEffect(() => {
    setIsRemembered(enhancedTokenStorage.getRememberMeStatus());
  }, []);

  if (!isRemembered) return null;

  return (
    <div className="text-center mb-4">
      <Badge variant="secondary" className="text-xs">
        🔒 Đã lưu thông tin đăng nhập
      </Badge>
    </div>
  );
}
