import React, { useState } from 'react';
import { ExtractionResult } from '../types';
import { Download, FileText, Trash2, CheckCircle2, ShieldCheck, HelpCircle, FolderCheck, FolderPlus, Loader2, FileCheck, FolderTree } from 'lucide-react';

interface Step7Props {
  result: ExtractionResult;
  onClearData: () => void;
}

export const Step7_Results: React.FC<Step7Props> = ({ result, onClearData }) => {
  const [isSavingToFolder, setIsSavingToFolder] = useState(false);
  const [folderSaveSuccessMessage, setFolderSaveSuccessMessage] = useState<string | null>(null);

  const downloadZip = () => {
    if (!result.zipBlob) return;
    const url = URL.createObjectURL(result.zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.zipFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadReport = () => {
    const blob = new Blob([result.reportContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Extraction_Audit_Report_${result.zipFilename.replace('.zip', '')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Direct Save to Local Disk Directory using File System Access API
  const saveToDiskDirectory = async () => {
    if (!('showDirectoryPicker' in window)) {
      alert('Your web browser does not support selecting direct disk folders. Please use "Download ZIP" instead.');
      return;
    }

    try {
      setIsSavingToFolder(true);
      setFolderSaveSuccessMessage(null);

      // Prompt user to pick any target folder on their local computer
      const rootDirHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
      });

      let savedCount = 0;

      for (const item of result.items) {
        if (item.error || !item.finalFilename) continue;

        let targetDir = rootDirHandle;
        if (item.folderPath && item.folderPath !== 'root') {
          targetDir = await rootDirHandle.getDirectoryHandle(item.folderPath, { create: true });
        }

        const fileHandle = await targetDir.getFileHandle(item.finalFilename, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(item.item.anchor.data || new Uint8Array());
        await writable.close();
        savedCount++;
      }

      // Also save the audit report into the selected directory
      const reportName = `Extraction_Audit_Report_${result.zipFilename.replace('.zip', '')}.md`;
      const reportHandle = await rootDirHandle.getFileHandle(reportName, { create: true });
      const reportWritable = await reportHandle.createWritable();
      await reportWritable.write(result.reportContent);
      await reportWritable.close();

      setFolderSaveSuccessMessage(`Successfully written ${savedCount} files and audit report directly into your chosen folder!`);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        alert(`Failed to save to folder: ${err.message}`);
      }
    } finally {
      setIsSavingToFolder(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">Step 7: Extraction Complete!</h2>
        <p className="text-slate-400 text-sm">
          All your requested photos have been extracted, renamed, and are ready to save.
        </p>
      </div>

      {/* Easy Language Guide Box */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-xs space-y-2 text-emerald-200">
        <div className="flex items-center space-x-2 font-bold text-emerald-300">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span>💡 Quick Guide — Select Save Location on Disk</span>
        </div>
        <p className="text-slate-300">
          <strong>Option A (Direct Folder Save):</strong> Click <strong>Select Save Location on Disk</strong> below to open a folder picker and select the exact folder on your computer (e.g. <code>D:\Evidences\Case_101\</code>) where all renamed photos will be saved!
        </p>
        <p className="text-slate-300">
          <strong>Option B (ZIP Download):</strong> Click <strong>Download ZIP</strong> to save all files packaged in a single compressed ZIP file.
        </p>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <p className="text-xs text-slate-400 font-medium">Exported</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{result.exportedCount}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <p className="text-xs text-slate-400 font-medium">Skipped</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{result.skippedCount}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <p className="text-xs text-slate-400 font-medium">Duplicates</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{result.duplicateCount}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <p className="text-xs text-slate-400 font-medium">Unmapped</p>
          <p className="text-2xl font-bold text-slate-400 mt-1">{result.unmappedCount}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center col-span-2 sm:col-span-1">
          <p className="text-xs text-slate-400 font-medium">Errors</p>
          <p className="text-2xl font-bold text-rose-400 mt-1">{result.errorCount}</p>
        </div>
      </div>

      {folderSaveSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <FolderCheck className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{folderSaveSuccessMessage}</span>
        </div>
      )}

      {/* Extracted Files & Destination Paths List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-brand-400" />
            Extracted Files & Destination Folder Paths ({result.items.length} files)
          </h4>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[320px]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-200 uppercase text-[10px] tracking-wider font-semibold sticky top-0">
              <tr>
                <th className="px-3 py-2.5">#</th>
                <th className="px-3 py-2.5">Excel Cell</th>
                <th className="px-3 py-2.5">Media Column</th>
                <th className="px-3 py-2.5">Generated Filename</th>
                <th className="px-3 py-2.5">Destination Relative Path</th>
                <th className="px-3 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {result.items.map((exportedItem, idx) => {
                const i = exportedItem.item;
                const pathDisplay = exportedItem.folderPath && exportedItem.folderPath !== 'root'
                  ? `${exportedItem.folderPath}/${exportedItem.finalFilename}`
                  : exportedItem.finalFilename;

                return (
                  <tr key={idx} className="hover:bg-slate-800/40 font-mono">
                    <td className="px-3 py-2 text-slate-500">{idx + 1}</td>
                    <td className="px-3 py-2 text-brand-400 font-semibold">{i.cellRef} (Row {i.rowNumber})</td>
                    <td className="px-3 py-2 font-sans text-slate-300">{i.mediaColumn}</td>
                    <td className="px-3 py-2 text-emerald-400 font-semibold">{exportedItem.finalFilename}</td>
                    <td className="px-3 py-2 text-slate-300">{pathDisplay}</td>
                    <td className="px-3 py-2 font-sans">
                      {exportedItem.error ? (
                        <span className="inline-flex items-center text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded text-[11px]">
                          Error
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px]">
                          Success
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Direct Local Disk Directory Picker */}
        <button
          onClick={saveToDiskDirectory}
          disabled={isSavingToFolder}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold text-sm transition-colors shadow-lg shadow-brand-500/20 flex items-center justify-center space-x-2"
          title="Pick an exact folder location on your computer disk to save extracted files"
        >
          {isSavingToFolder ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <FolderPlus className="w-5 h-5" />
          )}
          <span>Select Save Location on Disk</span>
        </button>

        {/* Download ZIP */}
        <button
          onClick={downloadZip}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Download ZIP ({result.zipFilename})</span>
        </button>

        {/* Audit Report */}
        <button
          onClick={downloadReport}
          className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-colors flex items-center justify-center space-x-2 border border-slate-700"
        >
          <FileText className="w-4 h-4 text-brand-400" />
          <span>Download Report</span>
        </button>

        {/* Clear Data */}
        <button
          onClick={onClearData}
          className="w-full sm:w-auto px-4 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-medium text-sm transition-colors flex items-center justify-center space-x-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Sensitive Data</span>
        </button>
      </div>

      {/* Privacy guarantee notice */}
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 flex items-center justify-center space-x-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>Your files are written directly to your local computer disk. Zero server upload.</span>
      </div>
    </div>
  );
};
