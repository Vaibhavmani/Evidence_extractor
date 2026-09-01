import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { validateAndLoadZip, ZipSecurityError } from '../lib/security/zipGuard';

describe('ZipGuard Security Tests', () => {
  it('should unpack valid ZIP archive', async () => {
    const zip = new JSZip();
    zip.file('test.xml', '<root>hello</root>');
    const content = await zip.generateAsync({ type: 'arraybuffer' });

    const result = await validateAndLoadZip(content);
    expect(result.file('test.xml')).not.toBeNull();
  });

  it('should reject file exceeding compressed size safety limit', async () => {
    const dummyBuffer = new ArrayBuffer(200);
    await expect(
      validateAndLoadZip(dummyBuffer, { maxCompressedSizeBytes: 100 })
    ).rejects.toThrow(ZipSecurityError);
  });

  it('should reject archive with suspicious path traversal entry', async () => {
    const zip = new JSZip();
    zip.file('../malicious.txt', 'data');
    const content = await zip.generateAsync({ type: 'arraybuffer' });

    await expect(validateAndLoadZip(content)).rejects.toThrow(ZipSecurityError);
  });
});
