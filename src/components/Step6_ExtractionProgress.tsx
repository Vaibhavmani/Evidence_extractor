import React, { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { PreExtractionItem, ExtractionResult, PatternToken } from '../types';
import { generateAuditReport } from '../lib/report/generator';
import { ShieldCheck, XCircle, HelpCircle } from 'lucide-react';
import { sanitizeFilename } from '../lib/security/sanitizer';
import { UniqueProcessingLoader } from './UniqueProcessingLoader';

interface Step6Props {
  workbookName: string;
  sheetName: string;
  selectedMediaColumns: string[];
  tokens: PatternToken[];
  items: PreExtractionItem[];
  outputStructure: 'subfolders' | 'flat';
  onComplete: (result: ExtractionResult) => void;
  onCancel: () => void;
}

export const Step6_ExtractionProgress: React.FC<Step6Props> = ({
  workbookName,
  sheetName,
  selectedMediaColumns,
  tokens,
  items,
  outputStructure,
  onComplete,
  onCancel,
}) => {
  const [processedCount, setProcessedCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing extraction engine...');

  useEffect(() => {
    let isCancelled = false;

    const runExtraction = async () => {
      const zip = new JSZip();
      const exportItems: ExtractionResult['items'] = [];

      let exportedCount = 0;
      let skippedCount = 0;
      let duplicateCount = 0;
      let errorCount = 0;

      for (let i = 0; i < items.length; i++) {
        if (isCancelled) return;

        const item = items[i];
        setProcessedCount(i + 1);
        setStatusMessage(`Extracting & renaming photo ${i + 1} of ${items.length} (Row ${item.rowNumber}, Cell ${item.cellRef})...`);

        if (item.status === 'warning' && item.warningMessage?.includes('Skipped')) {
          skippedCount++;
          exportItems.push({
            item,
            finalFilename: item.generatedFilename,
            folderPath: outputStructure === 'subfolders' ? sanitizeFilename(item.mediaColumn) : '',
            error: 'Skipped by collision policy',
          });
          continue;
        }

        try {
          // Folder path inside ZIP
          const folderName = outputStructure === 'subfolders'
            ? sanitizeFilename(item.mediaColumn)
            : '';
          const zipPath = folderName ? `${folderName}/${item.generatedFilename}` : item.generatedFilename;

          // Lazy load binary media from zipEntry if data is not already in memory
          let u8Data = item.anchor.data;
          if (!u8Data && item.anchor.zipEntry) {
            u8Data = await item.anchor.zipEntry.async('uint8array');
            item.anchor.data = u8Data; // Cache for subsequent saves
          }

          if (u8Data) {
            zip.file(zipPath, u8Data);
            if (item.status === 'warning') {
              duplicateCount++;
            }
            exportedCount++;

            exportItems.push({
              item,
              finalFilename: item.generatedFilename,
              folderPath: folderName || 'root',
            });
          } else {
            errorCount++;
            exportItems.push({
              item,
              finalFilename: item.generatedFilename,
              folderPath: '',
              error: 'Media binary payload missing',
            });
          }
        } catch (err: any) {
          errorCount++;
          exportItems.push({
            item,
            finalFilename: item.generatedFilename,
            folderPath: '',
            error: err.message || 'Extraction error',
          });
        }

        // Yield execution to keep UI responsive
        await new Promise(res => setTimeout(res, 5));
      }

      if (isCancelled) return;

      setStatusMessage('Bundling your photos into a ZIP file in local memory...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const nowStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const zipFilename = `Extracted_Media_${nowStr}.zip`;

      const partialResult: ExtractionResult = {
        totalFound: items.length,
        exportedCount,
        skippedCount,
        unmappedCount: 0,
        duplicateCount,
        errorCount,
        items: exportItems,
        zipBlob,
        zipFilename,
        reportContent: '',
      };

      const reportContent = generateAuditReport(
        partialResult,
        workbookName,
        sheetName,
        selectedMediaColumns,
        tokens
      );

      const finalResult: ExtractionResult = {
        ...partialResult,
        reportContent,
      };

      onComplete(finalResult);
    };

    runExtraction();

    return () => {
      isCancelled = true;
    };
  }, []);

  const percent = Math.round((processedCount / (items.length || 1)) * 100);

  return (
    <div className="space-y-6 max-w-xl mx-auto py-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-100">Step 6: Extracting & Renaming Photos</h2>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <UniqueProcessingLoader message={statusMessage} subtext={`Extracting photo ${processedCount} of ${items.length}`} />
      </div>

      {/* Easy Language Guide Box */}
      <div className="bg-brand-500/10 border border-brand-500/30 rounded-2xl p-4 text-xs space-y-2 text-brand-200">
        <div className="flex items-center space-x-2 font-bold text-brand-300">
          <HelpCircle className="w-4 h-4 text-brand-400" />
          <span>💡 Quick Guide — What is happening in Step 6</span>
        </div>
        <p className="text-slate-300">
          The tool is extracting your photos directly from the Excel file on your computer and renaming each file using your custom pattern rule.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold text-slate-300">
          <span>Extraction Progress</span>
          <span>{percent}% ({processedCount} / {items.length})</span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full transition-all duration-200"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>100% Local processing active. Safe & private.</span>
        </div>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 font-medium"
        >
          <XCircle className="w-4 h-4" /> Cancel Extraction
        </button>
      </div>
    </div>
  );
};
