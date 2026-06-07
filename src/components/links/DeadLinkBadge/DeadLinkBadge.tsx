import React from 'react'
import { Chip } from '@/components/ui/Chip'

export function DeadLinkBadge(): React.JSX.Element {
  return (
    <Chip variant="status" statusType="dead">
      Dead Link
    </Chip>
  )
}
