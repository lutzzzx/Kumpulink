'use client'

import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createLinkAction } from '@/actions/link.actions'
import styles from './AddLinkModal.module.css'

export interface AddLinkModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddLinkModal({ isOpen, onClose }: AddLinkModalProps): React.JSX.Element {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!url) {
      setError('URL is required')
      return
    }

    setLoading(true)

    try {
      const res = await createLinkAction({
        url,
        title: title || undefined,
        description: description || undefined,
      })

      if (res.success) {
        setUrl('')
        setTitle('')
        setDescription('')
        onClose()
      } else {
        setError(res.error || 'Failed to save link.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Link" glass>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.errorAlert}>{error}</div>}

        <Input
          label="Link URL"
          type="url"
          placeholder="https://example.com/some-page"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          required
        />
        <p className={styles.helpText}>Enter the complete URL, including http:// or https://</p>

        <Input
          label="Title (Optional)"
          type="text"
          placeholder="My custom title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />
        <p className={styles.helpText}>Leave blank to automatically scrape the page title.</p>

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
          {loading ? 'Adding Link...' : 'Add Link'}
        </Button>
      </form>
    </Modal>
  )
}
