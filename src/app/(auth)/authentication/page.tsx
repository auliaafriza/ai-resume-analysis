import Link from "next/link"

export default function AuthenticationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-card-foreground">Sign in</h1>
        <p className="mb-6 text-sm text-muted-foreground">Access your AI Resume Review dashboard</p>
        {/* Auth form placeholder — wire up your preferred auth provider here */}
        <div className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
          Authentication not yet configured. Go to{" "}
          <Link href="/resume-review" className="underline">
            Resume Review
          </Link>{" "}
          to try the app.
        </div>
      </div>
    </div>
  )
}
