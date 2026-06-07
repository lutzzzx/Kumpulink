'use client'

import React, { useState, useTransition, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createTagAction, updateTagAction, deleteTagAction, getUserTagsAction } from '@/actions/tag.actions'
import { type TagItem } from '../TagPicker'
import styles from './TagManager.module.css'

const PRESET_COLORS = [
  '#E11D48', // Red
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#4F46E5', // Indigo
  '#0EA5E9', // Sky
  '#10B981', // Green
  '#F59E0B', // Amber
  '#F97316', // Orange
]


export interface TagManagerProps {
  tags?: TagItem[]
}

export function TagManager({ tags: initialTags }: TagManagerProps): React.JSX.Element {
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0])
  const [editingTag, setEditingTag] = useState<TagItem | null>(null)
  
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [tags, setTags] = useState<TagItem[]>(initialTags || [])

  const refreshTags = useCallback(() => {
    return getUserTagsAction().then((res) => {
      if (res.success && res.data) {
        setTags(res.data)
      }
    })
  }, [])

  useEffect(() => {
    if (!initialTags) {
      getUserTagsAction().then((res) => {
        if (res.success && res.data) {
          setTags(res.data)
        }
      })
    }
  }, [initialTags])

  const handleCreateOrUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setErrorMsg(null)
    startTransition(async () => {
      if (editingTag) {
        const res = await updateTagAction({
          id: editingTag.id,
          name: name.trim(),
          color: selectedColor,
        })
        if (res.success) {
          setEditingTag(null)
          setName('')
          setSelectedColor(PRESET_COLORS[0])
          await refreshTags()
        } else {
          setErrorMsg(res.error || 'Failed to update tag.')
        }
      } else {
        const res = await createTagAction({
          name: name.trim(),
          color: selectedColor,
        })
        if (res.success) {
          setName('')
          setSelectedColor(PRESET_COLORS[0])
          await refreshTags()
        } else {
          setErrorMsg(res.error || 'Failed to create tag.')
        }
      }
    })
  }

  const handleEditSelect = (tag: TagItem) => {
    setEditingTag(tag)
    setName(tag.name)
    setSelectedColor(tag.color)
  }

  const handleCancelEdit = () => {
    setEditingTag(null)
    setName('')
    setSelectedColor(PRESET_COLORS[0])
    setErrorMsg(null)
  }

  const handleDelete = (tagId: string) => {
    setErrorMsg(null)
    if (window.confirm('Are you sure you want to delete this tag? It will be removed from all bookmarks.')) {
      startTransition(async () => {
        const res = await deleteTagAction(tagId)
        if (!res.success) {
          setErrorMsg(res.error || 'Failed to delete tag.')
        } else {
          if (editingTag?.id === tagId) {
            handleCancelEdit()
          }
          await refreshTags()
        }
      })
    }
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleCreateOrUpdate} className={styles.formSection}>
        <span className={styles.formTitle}>
          {editingTag ? 'Edit Tag' : 'Create New Tag'}
        </span>
        
        <Input
          label="Tag Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Tutorial, Read Later"
          maxLength={50}
          disabled={isPending}
          required
        />

        <div className={styles.inputGroup}>
          <span className={styles.inputLabel}>Tag Color</span>
          <div className={styles.colorGrid}>
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`${styles.colorSwatch} ${selectedColor === color ? styles.colorSwatchActive : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
                title={color}
                disabled={isPending}
              />
            ))}
          </div>
        </div>

        {errorMsg && <div className={styles.errorText}>{errorMsg}</div>}

        <div className={styles.formActions}>
          {editingTag && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              disabled={isPending}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isPending}
          >
            {editingTag ? (isPending ? 'Saving...' : 'Save Tag') : (isPending ? 'Creating...' : 'Create Tag')}
          </Button>
        </div>
      </form>

      <div className={styles.listSection}>
        <span className={styles.formTitle}>All Tags ({tags.length})</span>
        {tags.length === 0 ? (
          <p className={styles.emptyState}>No tags created yet.</p>
        ) : (
          tags.map((tag) => (
            <div key={tag.id} className={styles.tagRow}>
              <div className={styles.tagInfo}>
                <span className={styles.colorBadge} style={{ backgroundColor: tag.color }} />
                <span className={styles.tagName}>{tag.name}</span>
              </div>
              <div className={styles.tagActions}>
                <button
                  type="button"
                  onClick={() => handleEditSelect(tag)}
                  className={`${styles.actionBtn} ${styles.editBtn}`}
                  title="Edit Tag"
                  disabled={isPending}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(tag.id)}
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  title="Delete Tag"
                  disabled={isPending}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
