'use client'

import React from 'react'
import styles from './TagPicker.module.css'

export type TagItem = {
  id: string
  name: string
  color: string
}

export interface TagPickerProps {
  allTags: TagItem[]
  selectedTagIds: string[]
  onChange: (tagIds: string[]) => void
}

export function TagPicker({
  allTags,
  selectedTagIds,
  onChange,
}: TagPickerProps): React.JSX.Element {
  const handleToggle = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId))
    } else {
      onChange([...selectedTagIds, tagId])
    }
  }

  return (
    <div className={styles.container}>
      <span className={styles.label}>Tags</span>
      {allTags.length === 0 ? (
        <p className={styles.emptyText}>No tags created yet. Open the Tag Manager to create some!</p>
      ) : (
        <div className={styles.tagsGrid}>
          {allTags.map((tag) => {
            const isActive = selectedTagIds.includes(tag.id)
            const style = isActive
              ? { backgroundColor: tag.color }
              : undefined

            return (
              <button
                key={tag.id}
                type="button"
                className={`${styles.tagOption} ${isActive ? styles.tagOptionActive : ''}`}
                style={style}
                onClick={() => handleToggle(tag.id)}
              >
                <span
                  className={styles.colorIndicator}
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
