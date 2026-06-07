import { z } from 'zod'

export const ColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Please select a valid hex color')

export const CreateTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name must be 50 characters or less'),
  color: ColorSchema,
})

export type CreateTagInput = z.infer<typeof CreateTagSchema>

export const UpdateTagSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name must be 50 characters or less'),
  color: ColorSchema,
})

export type UpdateTagInput = z.infer<typeof UpdateTagSchema>

export const AssignTagsSchema = z.object({
  linkId: z.string().min(1),
  tagIds: z.array(z.string()),
})

export type AssignTagsInput = z.infer<typeof AssignTagsSchema>

export const BulkDeleteSchema = z.object({
  linkIds: z.array(z.string().min(1)).min(1, 'Select at least one link'),
})

export type BulkDeleteInput = z.infer<typeof BulkDeleteSchema>

export const BulkArchiveSchema = z.object({
  linkIds: z.array(z.string().min(1)).min(1, 'Select at least one link'),
})

export type BulkArchiveInput = z.infer<typeof BulkArchiveSchema>

export const BulkTagSchema = z.object({
  linkIds: z.array(z.string().min(1)).min(1, 'Select at least one link'),
  tagIds: z.array(z.string()),
})

export type BulkTagInput = z.infer<typeof BulkTagSchema>
