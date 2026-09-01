import { describe, it, expect } from 'vitest';
import { evaluateFilenamePattern } from '../lib/pattern/engine';
import { PatternToken, ExtractedMediaAnchor } from '../types';

describe('Pattern Engine Specification Tests', () => {
  it('should generate expected filename matching build pack specification example', () => {
    const rowObj = {
      'Index': 1,
      'Date & Time': '01:01:39 - 01:01:39',
      'Video Information': 'P84F118TOLOSTOYROAD(10.42.115.118).mkv',
      'Detected Face': 'image',
    };

    const anchor: ExtractedMediaAnchor = {
      row: 2,
      col: 4,
      colName: 'Detected Face',
      cellRef: 'D2',
      mediaPath: 'xl/media/image1.jpeg',
      ext: 'jpeg',
      mimeType: 'image/jpeg',
      data: new Uint8Array(),
      anchorType: 'twoCellAnchor',
    };

    const tokens: PatternToken[] = [
      { id: '1', type: 'column', value: 'Index' },
      { id: '2', type: 'text', value: '_' },
      { id: '3', type: 'column', value: 'Video Information' },
      { id: '4', type: 'text', value: '_' },
      { id: '5', type: 'column', value: 'Date & Time' },
      { id: '6', type: 'text', value: '_' },
      { id: '7', type: 'mediaType', value: '' },
    ];

    const result = evaluateFilenamePattern(tokens, rowObj, anchor, 'Detected Face');

    // Expected: 1_P84F118TOLOSTOYROAD(10.42.115.118).mkv_01_01_39_-_01_01_39_detected.jpeg or sanitized variant
    expect(result).toContain('1_P84F118TOLOSTOYROAD');
    expect(result).toContain('detected.jpeg');
    expect(result).not.toMatch(/[<>:"/\\|?*]/);
  });
});
