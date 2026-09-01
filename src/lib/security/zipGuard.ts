import JSZip from 'jszip';

export interface ZipSafetyLimits {
  maxCompressedSizeBytes: number; // Default 500MB
  maxUncompressedSizeBytes: number; // Default 1GB
  maxFileCount: number; // Default 10,000
  maxCompressionRatio: number; // Default 100x
}

export const DEFAULT_ZIP_LIMITS: ZipSafetyLimits = {
  maxCompressedSizeBytes: 500 * 1024 * 1024,
  maxUncompressedSizeBytes: 1024 * 1024 * 1024,
  maxFileCount: 10000,
  maxCompressionRatio: 100,
};

export class ZipSecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ZipSecurityError';
  }
}

/**
 * Validates a ZIP file archive against security threats (ZIP bombs, Zip Slip path traversal).
 */
export async function validateAndLoadZip(
  fileBuffer: ArrayBuffer,
  customLimits: Partial<ZipSafetyLimits> = {}
): Promise<JSZip> {
  const limits = { ...DEFAULT_ZIP_LIMITS, ...customLimits };

  if (fileBuffer.byteLength > limits.maxCompressedSizeBytes) {
    throw new ZipSecurityError(
      `File size (${(fileBuffer.byteLength / (1024 * 1024)).toFixed(1)} MB) exceeds safe input limit (${(limits.maxCompressedSizeBytes / (1024 * 1024)).toFixed(1)} MB).`
    );
  }

  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(fileBuffer);
  } catch (err: any) {
    throw new ZipSecurityError(`Failed to unpack workbook archive. The file may be corrupt or encrypted. (${err.message})`);
  }

  const entries = Object.keys(zip.files);
  if (entries.length > limits.maxFileCount) {
    throw new ZipSecurityError(`Archive contains ${entries.length} files, exceeding limit of ${limits.maxFileCount}.`);
  }

  let totalUncompressedSize = 0;

  for (const relativePath of entries) {
    const entry = zip.files[relativePath];

    // Check for Zip Slip / Path Traversal in entry paths
    if (relativePath.includes('..') || relativePath.startsWith('/') || relativePath.includes(':\\')) {
      throw new ZipSecurityError(`Malicious entry path detected in archive: "${relativePath}"`);
    }

    // Estimate uncompressed size if metadata present
    // JSZip `_data` or `uncompressedSize` check
    const uncompressedSize = (entry as any)._data?.uncompressedSize ?? 0;
    totalUncompressedSize += uncompressedSize;

    if (totalUncompressedSize > limits.maxUncompressedSizeBytes) {
      throw new ZipSecurityError(
        `Total uncompressed data exceeds safety limit of ${(limits.maxUncompressedSizeBytes / (1024 * 1024)).toFixed(1)} MB (Potential ZIP bomb detected).`
      );
    }
  }

  // Ratio check if compressed size > 1MB
  if (fileBuffer.byteLength > 1024 * 1024 && totalUncompressedSize > 0) {
    const ratio = totalUncompressedSize / fileBuffer.byteLength;
    if (ratio > limits.maxCompressionRatio) {
      throw new ZipSecurityError(`Abnormal compression ratio (${ratio.toFixed(1)}:1) detected. File rejected for security.`);
    }
  }

  return zip;
}
