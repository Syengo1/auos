"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { CreateJobWizard } from "./create-job-wizard"

type CreateJobDialogProps = {
  children: React.ReactNode;
  garageId: string;
  fleetVehicles: { id: string; regNumber: string; make: string; model: string }[];
}

export function CreateJobDialog({ children, garageId, fleetVehicles }: CreateJobDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {children}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 gap-0">
        <DialogTitle className="sr-only">Open New Job Card</DialogTitle>
        <div className="p-6 md:p-8">
          <CreateJobWizard 
            garageId={garageId} 
            availableVehicles={fleetVehicles} 
            onComplete={() => setOpen(false)} 
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}