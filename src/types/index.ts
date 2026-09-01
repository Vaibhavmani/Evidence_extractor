import JSZip from 'jszip';

export interface SheetSummary {
  name: string;
  rowCount: number;
  columnCount: number;
  headers: string[];
  sampleRows: Record<string, any>[];
  hasImages: boolean;
  imageCount: number;
}

export interface ExtractedMediaAnchor {
  row: number; // 1-indexed Excel row
  col: number; // 1-indexed Excel col
  colName: string; // Header name corresponding to col
  cellRef: string; // e.g. "D2"
  mediaPath: string; // e.g. "xl/media/image1.png"
  ext: string; // e.g. "png", "jpeg"
  mimeType: string;
  data?: Uint8Array; // Binary media data (populated on demand)
  zipEntry?: JSZip.JSZipObject; // Lazy ZIP handle for fast processing
  anchorType: 'oneCellAnchor' | 'twoCellAnchor' | 'unmapped';
}

export interface ParsedWorkbook {
  filename: string;
  sizeBytes: number;
  sheets: SheetSummary[];
  mediaAnchorsBySheet: Record<string, ExtractedMediaAnchor[]>;
  rawZipFiles: Record<string, Uint8Array>;
}

export type TokenType = 'column' | 'text' | 'mediaType' | 'rowNumber' | 'originalName' | 'extension';

export interface PatternToken {
  id: string;
  type: TokenType;
  value: string; // Header name for 'column', fixed text for 'text', etc.
}

export type DuplicatePolicy = 'auto-suffix' | 'skip' | 'row-number';

export interface PreExtractionItem {
  rowNumber: number;
  cellRef: string;
  mediaColumn: string;
  originalExt: string;
  generatedFilename: string;
  status: 'ready' | 'duplicate' | 'unmapped' | 'error' | 'warning';
  warningMessage?: string;
  anchor: ExtractedMediaAnchor;
}

export interface ExtractionResult {
  totalFound: number;
  exportedCount: number;
  skippedCount: number;
  unmappedCount: number;
  duplicateCount: number;
  errorCount: number;
  items: {
    item: PreExtractionItem;
    finalFilename: string;
    folderPath: string;
    blobUrl?: string;
    error?: string;
  }[];
  zipBlob?: Blob;
  zipFilename: string;
  reportContent: string;
}
