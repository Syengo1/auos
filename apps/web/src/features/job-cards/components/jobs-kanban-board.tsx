"use client"

import type { Dispatch, SetStateAction } from "react"
import { useState } from "react"
import type { JobCardPayload } from "./jobs-view-manager"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Car, Clock, Wrench, GripVertical } from "lucide-react"

type JobsKanbanBoardProps = {
  jobs: JobCardPayload[];
  setJobs: Dispatch<SetStateAction<JobCardPayload[]>>;
}

const KANBAN_COLUMNS = [
  { id: "diagnostic", title: "Diagnostics", color: "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" },
  { id: "pending_approval", title: "Estimate Sent", color: "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" },
  { id: "in_progress", title: "In Progress", color: "border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" },
  { id: "completed", title: "Ready for QC", color: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" },
]

export function JobsKanbanBoard({ jobs, setJobs }: JobsKanbanBoardProps) {
  const [activeJob, setActiveJob] = useState<JobCardPayload | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  )

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const draggedJob = jobs.find((j) => j.id === active.id)
    if (draggedJob) setActiveJob(draggedJob)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveJob(null)
    const { active, over } = event

    if (!over) return

    const jobId = active.id as string
    const newStatus = over.id as JobCardPayload["status"]

    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* 
        THE FIX: Replaced complex height calculations with strict h-full w-full. 
        The parent component now handles the bounds, allowing this to fill precisely.
      */}
      <div className="flex h-full w-full gap-4 overflow-x-auto pb-4 
        [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent 
        [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20">
        
        {KANBAN_COLUMNS.map((col) => {
          const columnJobs = jobs.filter((job) => job.status === col.id)
          return (
            <KanbanColumn key={col.id} id={col.id} title={col.title} color={col.color} jobs={columnJobs} />
          )
        })}
      </div>

      <DragOverlay dropAnimation={{ duration: 250, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
        {activeJob ? <KanbanCard job={activeJob} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}

function KanbanColumn({ id, title, color, jobs }: { id: string; title: string; color: string; jobs: JobCardPayload[] }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div 
      ref={setNodeRef} 
      className={`flex h-full w-[280px] sm:w-80 shrink-0 flex-col rounded-xl bg-muted/30 p-2 sm:p-3 transition-colors ${
        isOver ? "ring-2 ring-primary bg-muted/60" : ""
      }`}
    >
      <div className={`mb-3 flex shrink-0 items-center justify-between rounded-lg border px-3 py-2 text-sm font-semibold shadow-sm ${color}`}>
        <span>{title}</span>
        <span className="flex size-6 items-center justify-center rounded-full bg-background/50 text-xs shadow-sm">
          {jobs.length}
        </span>
      </div>
      
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1 
        [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent 
        [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20">
        {jobs.map((job) => (
          <KanbanCard key={job.id} job={job} />
        ))}
        <div className="h-2 shrink-0"></div> 
      </div>
    </div>
  )
}

function KanbanCard({ job, isOverlay = false }: { job: JobCardPayload; isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: job.id,
    data: job,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isOverlay ? 50 : undefined,
  }

  const formattedDate = new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative flex cursor-grab flex-col gap-3 rounded-lg border bg-background p-4 shadow-sm touch-none active:cursor-grabbing ${
        isDragging && !isOverlay ? "opacity-30" : "hover:border-primary/50 hover:shadow-md transition-all"
      } ${isOverlay ? "rotate-2 scale-105 shadow-2xl ring-1 ring-primary/20 cursor-grabbing" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center rounded bg-primary/10 px-2 py-1 text-xs font-bold text-primary tracking-widest border border-primary/20 uppercase">
          {job.vehicle.regNumber}
        </div>
        <GripVertical className="size-4 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
      </div>

      <div>
        <h4 className="font-semibold text-foreground flex items-center gap-1.5">
          <Car className="size-4 text-muted-foreground shrink-0" />
          <span className="truncate">{job.vehicle.make} {job.vehicle.model}</span>
        </h4>
        {job.clientNotes && (
          <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground border-l-2 pl-2 border-muted-foreground/30">
            &quot;{job.clientNotes}&quot;
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t pt-2 text-[11px] text-muted-foreground font-medium">
        <div className="flex items-center gap-1">
          <Wrench className="size-3 shrink-0" />
          {job.mileageIn.toLocaleString()} km
        </div>
        <div className="flex items-center gap-1">
          <Clock className="size-3 shrink-0" />
          {formattedDate}
        </div>
      </div>
    </div>
  )
}