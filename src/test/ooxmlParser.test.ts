import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parseExcelWorkbook } from '../lib/ooxml/parser';

describe('OOXML Workbook Parser Specification Tests', () => {
  it('should parse Realistic_Excel_Media_Stress_Test.xlsx and extract 2 sheets with 114 total media anchors', async () => {
    const filePath = path.resolve(process.cwd(), 'Realistic_Excel_Media_Stress_Test.xlsx');
    const fileBuffer = fs.readFileSync(filePath);

    const wb = await parseExcelWorkbook(fileBuffer.buffer, 'Realistic_Excel_Media_Stress_Test.xlsx');

    expect(wb).not.toBeNull();
    expect(wb.sheets.length).toBe(2);

    const sheet1 = wb.sheets.find(s => s.name === 'Camera Detections');
    const sheet2 = wb.sheets.find(s => s.name === 'Alternate Schema');

    expect(sheet1).toBeDefined();
    expect(sheet2).toBeDefined();

    expect(sheet1?.rowCount).toBe(60);
    expect(sheet1?.hasImages).toBe(true);
    expect(sheet1?.imageCount).toBe(105);

    expect(sheet2?.rowCount).toBe(10);
    expect(sheet2?.hasImages).toBe(true);
    expect(sheet2?.imageCount).toBe(9);

    const totalMedia = (sheet1?.imageCount || 0) + (sheet2?.imageCount || 0);
    expect(totalMedia).toBe(114);
  });

  it('should parse Secure_Media_Extractor_Test.xlsx workbook successfully', async () => {
    const filePath = path.resolve(process.cwd(), 'Secure_Media_Extractor_Test.xlsx');
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      const wb = await parseExcelWorkbook(fileBuffer.buffer, 'Secure_Media_Extractor_Test.xlsx');
      expect(wb.sheets.length).toBeGreaterThan(0);
    }
  });
});
