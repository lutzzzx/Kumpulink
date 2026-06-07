'use client'

import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { updateLinkAction } from '@/actions/link.actions'
import { type LinkItem } from '../LinkCard'
import styles from './EditLinkModal.module.css'

export interface EditLinkModalProps {
  isOpen: boolean
  onClose: () => void
  link: LinkItem | null
}

export function EditLinkModal({ isOpen, onClose, link }: EditLinkModalProps): React.JSX.Element {
  const [title, setTitle] = useState(link?.title || '')
  const [description, setDescription] = useState(link?.description || '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!link) return
    if (!title) {
      setError('Title is required')
      return
    }

    setLoading(true)

    try {
      const res = await updateLinkAction({
        id: link.id,
        title,
        description: description || undefined,
      })

      if (res.success) {
        onClose()
      } else {
        setError(res.error || 'Failed to update link.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Link Details" glass>
      {link && (
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorAlert}>{error}</div>}

          <div>
            <span className={styles.originalLinkLabel}>Original Link</span>
            <div className={styles.urlDisplay}>{link.url}</div>
          </div>

          <Input
            label="Title"
            type="text"
            placeholder="Link title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            required
          />

          <Input
            label="Description (Optional)"
            type="text"
            placeholder="A brief description of this bookmark"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </form>
      )}
    </Modal>
  )
}
