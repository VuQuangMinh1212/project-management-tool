"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ReportsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/manager/dashboard")
  }, [router])

  return (
    <div className="p-6">
      <div className="text-center">
        <p>Đang chuyển hướng đến bảng điều khiển tích hợp...</p>
      </div>
    </div>
  )
}
