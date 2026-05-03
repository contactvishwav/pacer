// TODO: wire to GET /api/race-prediction
export default function RaceGoalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Race Goal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Riegel-based race time prediction with confidence intervals and gap analysis.
        </p>
      </div>
    </div>
  )
}
