import { Stepper, Step, StepLabel, Box } from '@mui/material'
import type { BookingStatus } from '../../../types/booking'

const STEPS = ['Submitted', 'Under Review', 'Decision']

function getActiveStep(status: BookingStatus): number {
  if (status === 'PENDING') return 1
  return 2
}

interface Props {
  status: BookingStatus
}

export default function BookingStatusStepper({ status }: Props) {
  if (status === 'CANCELLED') {
    return (
      <Box sx={{ color: 'text.secondary', fontSize: 14 }}>
        This booking was cancelled.
      </Box>
    )
  }

  return (
    <Stepper activeStep={getActiveStep(status)} sx={{ my: 2 }}>
      {STEPS.map((label, i) => {
        const isDecisionStep = i === 2
        const stepProps: { completed?: boolean } = {}
        const labelProps: { error?: boolean; optional?: React.ReactNode } = {}

        if (isDecisionStep && status === 'REJECTED') {
          labelProps.error = true
        }
        if (i < getActiveStep(status)) stepProps.completed = true

        return (
          <Step key={label} {...stepProps}>
            <StepLabel {...labelProps}>
              {isDecisionStep && status !== 'PENDING' ? status.charAt(0) + status.slice(1).toLowerCase() : label}
            </StepLabel>
          </Step>
        )
      })}
    </Stepper>
  )
}
