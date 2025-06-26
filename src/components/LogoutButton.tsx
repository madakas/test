'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
    >
      Sign Out
    </button>
  )
} 