'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function DashboardButton() {
  const { update } = useSession()
  const router = useRouter()

  const handleClick = async () => {
    await update()          // forces NextAuth to re-read status from DB
    router.push('/teacher/feed')
    router.refresh()
  }

  return (
    <button
      onClick={handleClick}
      className="w-full block py-4 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-extrabold text-base rounded-xl hover:opacity-90 transition-opacity text-center shadow-lg shadow-orange-200"
    >
      🚀 Go to Dashboard
    </button>
  )
}