"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CarFront, ChevronRight, ChevronLeft, ClipboardList, Loader2, CheckCircle2 } from "lucide-react"
import { createJobCard } from "../actions" // Your existing server action
import { toast } from "sonner"

// Animation variants for smooth sliding
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
}

type CreateJobWizardProps = {
  garageId: string;
  onComplete: () => void;
  // In a real scenario, you'd pass down the fleet data or use a search endpoint
  availableVehicles: { id: string; regNumber: string; make: string; model: string }[];
}

export function CreateJobWizard({ garageId, availableVehicles, onComplete }: CreateJobWizardProps) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [mileageIn, setMileageIn] = useState("")
  const [clientNotes, setClientNotes] = useState("")

  const navigate = (newStep: number) => {
    setDirection(newStep > step ? 1 : -1)
    setStep(newStep)
  }

  const handleSubmit = async () => {
    if (!selectedVehicle || !mileageIn) return
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append("garageId", garageId)
    formData.append("vehicleId", selectedVehicle)
    formData.append("mileageIn", mileageIn)
    formData.append("clientNotes", clientNotes)

    const response = await createJobCard(formData)

    setIsSubmitting(false)
    if (response.success) {
      toast.success("Job Card opened successfully.")
      navigate(2) // Move to success screen
      setTimeout(onComplete, 2000)
    } else {
      toast.error(response.error || "Failed to create job.")
    }
  }

  return (
    <div className="relative h-[400px] w-full overflow-hidden bg-background">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute inset-0 flex flex-col"
        >
          {/* STEP 0: VEHICLE SELECTION */}
          {step === 0 && (
            <div className="flex h-full flex-col">
              <div className="mb-6">
                <h3 className="text-lg font-bold tracking-tight">Select Asset</h3>
                <p className="text-sm text-muted-foreground">Search the ledger for the incoming vehicle.</p>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {availableVehicles.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      selectedVehicle === vehicle.id 
                        ? "border-primary bg-primary/5 text-primary" 
                        : "border-border hover:border-primary/30 hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-background rounded-lg border shadow-sm">
                        <CarFront className="size-5" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-bold">{vehicle.regNumber}</span>
                        <span className="text-xs text-muted-foreground">{vehicle.make} {vehicle.model}</span>
                      </div>
                    </div>
                    {selectedVehicle === vehicle.id && <CheckCircle2 className="size-5" />}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <Button disabled={!selectedVehicle} onClick={() => navigate(1)} className="w-full sm:w-auto">
                  Next Step <ChevronRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 1: INTAKE DETAILS */}
          {step === 1 && (
            <div className="flex h-full flex-col">
              <div className="mb-6">
                <h3 className="text-lg font-bold tracking-tight">Intake Details</h3>
                <p className="text-sm text-muted-foreground">Log the initial state and client concerns.</p>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="mileageIn">Current Mileage (In)</Label>
                  <Input 
                    id="mileageIn" 
                    type="number" 
                    placeholder="e.g. 54000" 
                    value={mileageIn}
                    onChange={(e) => setMileageIn(e.target.value)}
                    autoFocus
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="clientNotes">Client Complaint / Notes</Label>
                  <textarea 
                    id="clientNotes"
                    className="flex min-h-[120px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="e.g. Customer reports hearing a grinding noise when braking..."
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={() => navigate(0)}>
                  <ChevronLeft className="mr-2 size-4" /> Back
                </Button>
                <Button disabled={!mileageIn || isSubmitting} onClick={handleSubmit}>
                  {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <ClipboardList className="mr-2 size-4" />}
                  {isSubmitting ? "Opening Job..." : "Create Job Card"}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: SUCCESS */}
          {step === 2 && (
            <div className="flex h-full flex-col items-center justify-center text-center space-y-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                <CheckCircle2 className="size-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">Job Card Active</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-[250px] mx-auto">
                  The vehicle has been successfully routed to the Diagnostic bay.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}