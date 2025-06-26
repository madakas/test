import { createClient } from '@/lib/supabase/server'
import Navbar from './Navbar'

interface AppLayoutProps {
  children: React.ReactNode
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Map Supabase user to our expected format
  const mappedUser = user ? {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || undefined
  } : null

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mappedUser} />
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
} 