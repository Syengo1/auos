"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { AddVehicleModal } from "./add-vehicle-modal"

export function AddVehicleDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Removed asChild. The DialogTrigger will natively handle the click events. */}
      <DialogTrigger>
        {children}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[550px] p-6 md:p-8">
        <DialogTitle className="sr-only">Register New Vehicle</DialogTitle>
        <AddVehicleModal onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}