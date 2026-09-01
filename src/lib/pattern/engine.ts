import { ExtractedMediaAnchor, PatternToken } from '../../types';
import { sanitizeFilename } from '../security/sanitizer';

/**
 * Evaluates a list of pattern tokens against a specific Excel row object and media anchor.
 */
export function evaluateFilenamePattern(
  tokens: PatternToken[],
  rowObj: Record<string, any>,
  anchor: ExtractedMediaAnchor,
  mediaColumnName: string
): string {
  let parts: string[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case 'column': {
        const val = rowObj[token.value];
        const strVal = (val !== undefined && val !== null) ? String(val) : '';
        parts.push(strVal);
        break;
      }
      case 'text': {
        parts.push(token.value);
        break;
      }
      case 'mediaType': {
        // Derive media type token (e.g., 'Detected Face' -> 'detected', or explicit token.value)
        const val = token.value || mediaColumnName;
        const normalized = val.toLowerCase().includes('face')
          ? 'detected'
          : val.toLowerCase().includes('poi')
          ? 'poi'
          : val.toLowerCase().replace(/[^a-z0-9]/g, '_');
        parts.push(normalized);
        break;
      }
      case 'rowNumber': {
        parts.push(String(anchor.row));
        break;
      }
      case 'originalName': {
        const origBase = anchor.mediaPath.split('/').pop() || 'media';
        const nameWithoutExt = origBase.substring(0, origBase.lastIndexOf('.')) || origBase;
        parts.push(nameWithoutExt);
        break;
      }
      case 'extension': {
        // Handled at final extension attachment
        break;
      }
    }
  }

  const rawStem = parts.join('').trim() || `media_row${anchor.row}`;
  const sanitizedStem = sanitizeFilename(rawStem, `media_row${anchor.row}`);
  return `${sanitizedStem}.${anchor.ext}`;
}

/**
 * Default preset pattern generator matching the build pack spec:
 * [Index]_[Video Information]_[Date & Time]_[Media Type]
 */
export function getDefaultPatternTokens(headers: string[]): PatternToken[] {
  const tokens: PatternToken[] = [];

  const indexHeader = headers.find(h => /^index$/i.test(h.trim())) || headers[0];
  const videoHeader = headers.find(h => /video/i.test(h.trim()));
  const dateHeader = headers.find(h => /date|time/i.test(h.trim()));

  if (indexHeader) {
    tokens.push({ id: 't-1', type: 'column', value: indexHeader });
    tokens.push({ id: 't-2', type: 'text', value: '_' });
  }

  if (videoHeader) {
    tokens.push({ id: 't-3', type: 'column', value: videoHeader });
    tokens.push({ id: 't-4', type: 'text', value: '_' });
  }

  if (dateHeader) {
    tokens.push({ id: 't-5', type: 'column', value: dateHeader });
    tokens.push({ id: 't-6', type: 'text', value: '_' });
  }

  tokens.push({ id: 't-7', type: 'mediaType', value: '' });

  return tokens;
}
