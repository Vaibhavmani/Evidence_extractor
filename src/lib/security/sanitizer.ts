import { DuplicatePolicy } from '../../types';

// Reserved device names in Windows filesystems
const WINDOWS_RESERVED_NAMES = new Set([
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
]);

/**
 * Sanitizes a single path segment or filename string to ensure safe local filesystem usage.
 */
export function sanitizeFilename(input: string, fallbackDefault = 'unnamed_file'): string {
  if (!input || typeof input !== 'string') {
    return fallbackDefault;
  }

  // Normalize Unicode (NFC)
  let name = input.normalize('NFC');

  // Strip control characters (ASCII 0-31 and 127)
  name = name.replace(/[\x00-\x1F\x7F]/g, '');

  // Strip illegal Windows / POSIX filename characters: < > : " / \ | ? *
  name = name.replace(/[<>:"/\\|?*]/g, '_');

  // Prevent path traversal markers explicitly
  name = name.replace(/\.\.+/g, '.');

  // Collapse multiple spaces or underscores
  name = name.replace(/\s+/g, ' ').replace(/_+/g, '_').trim();

  // Strip trailing periods or spaces (Windows restriction)
  name = name.replace(/[\s.]+$/, '');

  // Check if sanitized name matches Windows reserved system name (case insensitive)
  const upperStem = name.split('.')[0].toUpperCase();
  if (WINDOWS_RESERVED_NAMES.has(upperStem)) {
    name = `safe_${name}`;
  }

  // If name became empty after sanitization
  if (!name || name === '.' || name === '..') {
    name = fallbackDefault;
  }

  // Truncate to maximum safe filename length (200 characters)
  if (name.length > 200) {
    const extIdx = name.lastIndexOf('.');
    if (extIdx > 0 && extIdx > name.length - 10) {
      const ext = name.substring(extIdx);
      name = name.substring(0, 190) + ext;
    } else {
      name = name.substring(0, 200);
    }
  }

  return name;
}

/**
 * Resolves collision/duplicate filenames according to user-selected policy.
 */
export function resolveDuplicates(
  items: { id: string; targetName: string; rowNumber: number }[],
  policy: DuplicatePolicy
): { id: string; finalName: string; isDuplicate: boolean }[] {
  const seenCountMap = new Map<string, number>();
  const results: { id: string; finalName: string; isDuplicate: boolean }[] = [];

  for (const item of items) {
    const base = item.targetName;
    const currentCount = seenCountMap.get(base) || 0;
    seenCountMap.set(base, currentCount + 1);

    if (currentCount === 0) {
      results.push({ id: item.id, finalName: base, isDuplicate: false });
    } else {
      // Collision detected
      if (policy === 'skip') {
        results.push({ id: item.id, finalName: '', isDuplicate: true });
      } else if (policy === 'row-number') {
        const extIdx = base.lastIndexOf('.');
        let newName: string;
        if (extIdx > 0) {
          newName = `${base.substring(0, extIdx)}_row${item.rowNumber}${base.substring(extIdx)}`;
        } else {
          newName = `${base}_row${item.rowNumber}`;
        }
        results.push({ id: item.id, finalName: sanitizeFilename(newName), isDuplicate: true });
      } else {
        // Default: auto-suffix (_2, _3, etc.)
        const extIdx = base.lastIndexOf('.');
        let newName: string;
        if (extIdx > 0) {
          newName = `${base.substring(0, extIdx)}_${currentCount + 1}${base.substring(extIdx)}`;
        } else {
          newName = `${base}_${currentCount + 1}`;
        }
        results.push({ id: item.id, finalName: sanitizeFilename(newName), isDuplicate: true });
      }
    }
  }

  return results;
}
