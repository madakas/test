import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Kanban, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center py-12">
          <div className="flex justify-center mb-6">
            <Kanban className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            RetroBoard
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A modern retrospective board application for teams to reflect, improve, and plan together.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/login">
              <Button size="lg">
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Kanban className="h-5 w-5 mr-2" />
                Kanban Boards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create customizable kanban-style boards for your retrospectives with drag-and-drop functionality.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Kanban className="h-5 w-5 mr-2" />
                Real-time Collaboration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Work together with your team in real-time. See changes instantly as they happen.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Kanban className="h-5 w-5 mr-2" />
                Modern Interface
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Clean, modern interface with dark/light mode support for the best user experience.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
