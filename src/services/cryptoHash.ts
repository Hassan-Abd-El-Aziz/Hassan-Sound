/**
 * Computes a hex-encoded SHA-256 content hash for an audio file.
 * Uses Web Crypto API with cross-environment fallback for FileReader.
 */
export async function computeFileHash(file: File | Blob): Promise<string> {
  let buffer: ArrayBuffer

  if (typeof file.arrayBuffer === 'function') {
    buffer = await file.arrayBuffer()
  } else {
    buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(file)
    })
  }

  // Ensure TypedArray view is passed for full compatibility across browser and jsdom
  const uint8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  const hashBuffer = await crypto.subtle.digest('SHA-256', uint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
