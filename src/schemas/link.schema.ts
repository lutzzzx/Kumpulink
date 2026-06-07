import { z } from 'zod'

export const CreateLinkSchema = z.object({
  url: z.string().url('Please enter a valid URL (starting with http:// or https://)'),
  title: z.string().max(255, 'Title must be 255 characters or less').optional(),
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
  tagIds: z.array(z.string()).optional(),
})

export type CreateLinkInput = z.infer<typeof CreateLinkSchema>

export const UpdateLinkSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, 'Title is required').max(255, 'Title must be 255 characters or less'),
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional().nullable(),
  tagIds: z.array(z.string()).optional(),
})

export type UpdateLinkInput = z.infer<typeof UpdateLinkSchema>
