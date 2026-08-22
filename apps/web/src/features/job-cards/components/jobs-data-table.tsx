"use client"

import type { JobCardPayload } from "./jobs-view-manager"

export function JobsDataTable({ jobs }: { jobs: JobCardPayload[] }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center border-2 border-dashed rounded-xl bg-muted/10 p-10">
      <h3 className="text-lg font-semibold tracking-tight">Dense Data Table</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm">
        This modular component will house the @tanstack/react-table logic, providing robust sorting, filtering, and pagination for {jobs.length} active service records.
      </p>
    </div>
  )
}