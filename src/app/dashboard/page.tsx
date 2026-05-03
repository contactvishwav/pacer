// TODO: wire to GET /api/dashboard
import { Loading } from '@/components/loading'
import { Empty } from '@/components/empty'
import { ErrorState } from '@/components/error'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your training overview — where you are, risks, pace, and what to do next.
        </p>
      </div>

      {/* Skeleton demo */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Loading state
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Loading lines={4} />
        </CardContent>
      </Card>

      {/* Empty state demo */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Empty state
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Empty
            title="No training data yet"
            description="Seed the database to start seeing your training overview."
          />
        </CardContent>
      </Card>

      {/* Error state demo */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Error state
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState message="Could not load dashboard data. Check your database connection." />
        </CardContent>
      </Card>
    </div>
  )
}
