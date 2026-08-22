"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutGrid, List } from "lucide-react"
import { JobsKanbanBoard } from "./jobs-kanban-board"
import { JobsDataTable } from "./jobs-data-table"

export type JobCardPayload = {
  id: string;
  status: "diagnostic" | "pending_approval" | "in_progress" | "completed" | "paid" | "cancelled";
  mileageIn: number;
  clientNotes: string | null;
  createdAt: Date;
  vehicle: {
    id: string;
    regNumber: string;
    make: string;
    model: string;
  };
}

export function JobsViewManager({ 
  initialJobs, 
  garageId, 
  fleetVehicles 
}: { 
  initialJobs: JobCardPayload[];
  garageId: string;
  fleetVehicles: { id: string; regNumber: string; make: string; model: string }[];
}) {
  const [jobs, setJobs] = useState<JobCardPayload[]>(initialJobs)

  return (
    // FIX: Passing strict heights down the chain via flex-1 min-h-0
    <Tabs defaultValue="kanban" className="w-full flex flex-col flex-1 min-h-0">
      
      <div className="flex items-center justify-between mb-4 shrink-0">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="kanban" className="gap-2 data-[state=active]:shadow-sm">
            <LayoutGrid className="size-4" /> Board View
          </TabsTrigger>
          <TabsTrigger value="table" className="gap-2 data-[state=active]:shadow-sm">
            <List className="size-4" /> List View
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 min-h-0 rounded-2xl border bg-card shadow-sm p-2 sm:p-4 md:p-6 flex flex-col">
        {/* FIX: Force TabsContent to inherit height so the board never exceeds container */}
        <TabsContent value="kanban" className="m-0 flex-1 min-h-0 outline-none flex flex-col">
          <JobsKanbanBoard jobs={jobs} setJobs={setJobs} />
        </TabsContent>

        <TabsContent value="table" className="m-0 flex-1 min-h-0 outline-none flex flex-col">
          <JobsDataTable jobs={jobs} />
        </TabsContent>
      </div>
    </Tabs>
  )
}