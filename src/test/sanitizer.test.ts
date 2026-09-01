import { describe, it, expect } from 'vitest';
import { sanitizeFilename, resolveDuplicates } from '../lib/security/sanitizer';

describe('Sanitizer Unit & Security Tests', () => {
  it('should remove illegal filesystem characters', () => {
    const raw = 'file<name>:with"illegal/path\\and|chars?.png';
    const sanitized = sanitizeFilename(raw);
    expect(sanitized).toBe('file_name_with_illegal_path_and_chars_.png');
    expect(sanitized).not.toMatch(/[<>:"/\\|?*]/);
  });

  it('should prevent path traversal attempts', () => {
    const raw = '../../etc/passwd..png';
    const sanitized = sanitizeFilename(raw);
    expect(sanitized).not.toContain('..');
    expect(sanitized).not.toContain('/');
  });

  it('should handle Windows reserved device names', () => {
    expect(sanitizeFilename('CON.jpeg')).toBe('safe_CON.jpeg');
    expect(sanitizeFilename('PRN.png')).toBe('safe_PRN.png');
    expect(sanitizeFilename('NUL')).toBe('safe_NUL');
    expect(sanitizeFilename('COM1.txt')).toBe('safe_COM1.txt');
  });

  it('should handle empty or whitespace-only inputs safely', () => {
    expect(sanitizeFilename('')).toBe('unnamed_file');
    expect(sanitizeFilename('   ')).toBe('unnamed_file');
    expect(sanitizeFilename('...')).toBe('unnamed_file');
  });

  it('should truncate extremely long filenames', () => {
    const longName = 'a'.repeat(300) + '.jpeg';
    const sanitized = sanitizeFilename(longName);
    expect(sanitized.length).toBeLessThanOrEqual(200);
    expect(sanitized.endsWith('.jpeg')).toBe(true);
  });

  it('should correctly resolve duplicate filename collisions using auto-suffix policy', () => {
    const items = [
      { id: '1', targetName: 'image.jpg', rowNumber: 2 },
      { id: '2', targetName: 'image.jpg', rowNumber: 3 },
      { id: '3', targetName: 'image.jpg', rowNumber: 4 },
    ];
    const resolved = resolveDuplicates(items, 'auto-suffix');
    expect(resolved[0].finalName).toBe('image.jpg');
    expect(resolved[1].finalName).toBe('image_2.jpg');
    expect(resolved[2].finalName).toBe('image_3.jpg');
  });

  it('should correctly resolve duplicate filename collisions using row-number policy', () => {
    const items = [
      { id: '1', targetName: 'image.jpg', rowNumber: 2 },
      { id: '2', targetName: 'image.jpg', rowNumber: 3 },
    ];
    const resolved = resolveDuplicates(items, 'row-number');
    expect(resolved[0].finalName).toBe('image.jpg');
    expect(resolved[1].finalName).toBe('image_row3.jpg');
  });

  it('should correctly resolve duplicate filename collisions using skip policy', () => {
    const items = [
      { id: '1', targetName: 'image.jpg', rowNumber: 2 },
      { id: '2', targetName: 'image.jpg', rowNumber: 3 },
    ];
    const resolved = resolveDuplicates(items, 'skip');
    expect(resolved[0].finalName).toBe('image.jpg');
    expect(resolved[1].finalName).toBe('');
    expect(resolved[1].isDuplicate).toBe(true);
  });
});
