'use client'

import React, { createContext, useContext, useState } from 'react'

interface MobileUIContextType {
  filterSheetOpen: boolean
  setFilterSheetOpen: (open: boolean) => void
  addModalOpen: boolean
  setAddModalOpen: (open: boolean) => void
  tagManagerOpen: boolean
  setTagManagerOpen: (open: boolean) => void
  closeAll: () => void
}

const MobileUIContext = createContext<MobileUIContextType | undefined>(undefined)

export function MobileUIProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [tagManagerOpen, setTagManagerOpen] = useState(false)

  const closeAll = () => {
    setFilterSheetOpen(false)
    setAddModalOpen(false)
    setTagManagerOpen(false)
  }

  return (
    <MobileUIContext.Provider
      value={{
        filterSheetOpen,
        setFilterSheetOpen,
        addModalOpen,
        setAddModalOpen,
        tagManagerOpen,
        setTagManagerOpen,
        closeAll,
      }}
    >
      {children}
    </MobileUIContext.Provider>
  )
}

export function useMobileUI(): MobileUIContextType {
  const context = useContext(MobileUIContext)
  if (!context) {
    throw new Error('useMobileUI must be used within a MobileUIProvider')
  }
  return context
}
