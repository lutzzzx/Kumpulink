'use client'

import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { updateLinkAction, scrapeTitleAction } from '@/actions/link.actions'
import { getUserTagsAction } from '@/actions/tag.actions'
import { TagPicker, type TagItem } from '@/components/tags/TagPicker'
import { type LinkItem } from '../LinkCard'
import { Tooltip } from '@/components/ui/Tooltip'
import styles from './EditLinkModal.module.css'

export interface EditLinkModalProps {
  isOpen: boolean
  onClose: () => void
  link: LinkItem | null
}

export function EditLinkModal({ isOpen, onClose, link }: EditLinkModalProps): React.JSX.Element {
  const [url, setUrl] = useState(link?.url || '')
  const [title, setTitle] = useState(link?.title || '')
  const [description, setDescription] = useState(link?.description || '')
  const [availableTags, setAvailableTags] = useState<TagItem[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(link?.tags?.map((t) => t.id) || [])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isScraping, setIsScraping] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (link) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUrl(link.url)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTitle(link.title)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDescription(link.description || '')
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedTagIds(link.tags?.map((t) => t.id) || [])
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setError(null)
      }
      getUserTagsAction().then((res) => {
        if (res.success && res.data) {
          setAvailableTags(res.data)
        }
      })
    }
  }, [isOpen, link])

  const handleScrape = async () => {
    if (!url) {
      setError('Please enter a URL first.')
      return
    }
    
    setIsScraping(true)
    setError(null)
    try {
      const res = await scrapeTitleAction(url)
      if (res.success && res.data) {
        setTitle(res.data.title)
      } else {
        setError(res.error || 'Failed to scrape title.')
      }
    } catch {
      setError('Something went wrong while scraping.')
    } finally {
      setIsScraping(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!link) return
    if (!url) {
      setError('URL is required')
      return
    }
    if (!title) {
      setError('Title is required')
      return
    }

    setLoading(true)

    try {
      const res = await updateLinkAction({
        id: link.id,
        url,
        title,
        description: description || undefined,
        tagIds: selectedTagIds,
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
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Link Details">
      {link && (
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorAlert}>{error}</div>}

          <Input
            label="URL"
            type="url"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            required
          />

          <div className={styles.titleRow}>
            <Input
              label="Title"
              type="text"
              placeholder="Link title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading || isScraping}
              required
            />
            <Tooltip content="Auto Scrape">
              <Button
                type="button"
                variant="secondary"
                onClick={handleScrape}
                disabled={loading || isScraping || !url}
                className={styles.scrapeBtn}
                aria-label="Auto Scrape"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isScraping ? styles.spin : ''}>
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                </svg>
              </Button>
            </Tooltip>
          </div>

          <Input
            label="Description (Optional)"
            type="text"
            placeholder="A brief description of this bookmark"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />

          <TagPicker
            allTags={availableTags}
            selectedTagIds={selectedTagIds}
            onChange={setSelectedTagIds}
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
