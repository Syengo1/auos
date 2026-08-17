"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { AddStaffModal } from "./add-staff-modal"

export function AddStaffDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {children}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] p-6 md:p-8">
        <DialogTitle className="sr-only">Provision Staff Account</DialogTitle>
        <AddStaffModal onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}