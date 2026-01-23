import { supabase } from './supabaseClient'

/**
 * Upload a file to Supabase Storage
 * @param {Object} params - Upload parameters
 * @param {File} params.file - File to upload
 * @param {string} params.bucket - Storage bucket name (default: 'reports')
 * @returns {Promise<{file_url: string}>} - Public URL of uploaded file
 */
export const UploadFile = async ({ file, bucket = 'reports' }) => {
  if (!file) {
    throw new Error('No file provided')
  }

  const fileName = `${Date.now()}-${file.name}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName)

  return {
    file_url: publicUrl,
    path: data.path
  }
}

/**
 * Extract data from uploaded file
 * NOTE: This is a placeholder. Base44's AI-based extraction is not available in Supabase.
 * You would need to integrate with OpenAI, Anthropic, or similar service for this functionality.
 *
 * For now, this function throws an error to indicate it's not implemented.
 */
export const ExtractDataFromUploadedFile = async ({ file_url, json_schema }) => {
  throw new Error(
    'ExtractDataFromUploadedFile is not implemented yet. ' +
    'This requires integration with an AI service (OpenAI, Anthropic, etc.). ' +
    'Please manually process CSV files for now.'
  )
}

/**
 * Invoke LLM (Large Language Model)
 * NOTE: Placeholder - requires API integration with OpenAI, Anthropic, etc.
 */
export const InvokeLLM = async (params) => {
  throw new Error('InvokeLLM is not implemented. Please integrate with OpenAI or Anthropic API.')
}

/**
 * Send Email
 * NOTE: Placeholder - requires email service integration (SendGrid, Resend, etc.)
 */
export const SendEmail = async (params) => {
  throw new Error('SendEmail is not implemented. Please integrate with an email service.')
}

/**
 * Generate Image
 * NOTE: Placeholder - requires image generation API (DALL-E, Midjourney, etc.)
 */
export const GenerateImage = async (params) => {
  throw new Error('GenerateImage is not implemented. Please integrate with an image generation service.')
}

/**
 * Create a signed URL for private file access
 * @param {string} path - File path in storage
 * @param {number} expiresIn - Expiration time in seconds (default: 3600)
 * @returns {Promise<{signedUrl: string}>}
 */
export const CreateFileSignedUrl = async (path, expiresIn = 3600) => {
  const { data, error } = await supabase.storage
    .from('reports')
    .createSignedUrl(path, expiresIn)

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`)
  }

  return {
    signedUrl: data.signedUrl
  }
}

/**
 * Upload a private file (requires authentication to access)
 * @param {Object} params - Upload parameters
 * @param {File} params.file - File to upload
 * @param {string} params.bucket - Storage bucket name (default: 'private-reports')
 * @returns {Promise<{file_url: string, path: string}>}
 */
export const UploadPrivateFile = async ({ file, bucket = 'private-reports' }) => {
  if (!file) {
    throw new Error('No file provided')
  }

  const fileName = `${Date.now()}-${file.name}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  // For private files, return the path (user needs to create signed URL to access)
  return {
    file_url: null, // No public URL for private files
    path: data.path
  }
}
