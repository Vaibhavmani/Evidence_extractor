import React from 'react';
import { SheetSummary, ExtractedMediaAnchor, PatternToken, DuplicatePolicy, PreExtractionItem } from '../types';
import { evaluateFilenamePattern } from '../lib/pattern/engine';
import { resolveDuplicates } from '../lib/security/sanitizer';
import { AlertCircle, CheckCircle2, AlertTriangle, ShieldCheck, FileCheck, HelpCircle } from 'lucide-react';

interface Step5Props {
  sheet: SheetSummary;
  anchors: ExtractedMediaAnchor[];
  selectedMediaColumns: string[];
  tokens: PatternToken[];
  duplicatePolicy: DuplicatePolicy;
  onUpdateDuplicatePolicy: (policy: DuplicatePolicy) => void;
  onStartExtraction: (preparedItems: PreExtractionItem[]) => void;
  onBack: () => void;
}

export const Step5_PreExtractionPreview: React.FC<Step5Props> = ({
  sheet,
  anchors,
  selectedMediaColumns,
  tokens,
  duplicatePolicy,
  onUpdateDuplicatePolicy,
  onStartExtraction,
  onBack,
}) => {
  // Filter anchors for chosen media columns
  const activeAnchors = anchors.filter(a => selectedMediaColumns.includes(a.colName));

  // Build raw generated filename for each anchor
  const rawItems = activeAnchors.map((anchor, idx) => {
    const rowObj = sheet.sampleRows.find(r => r._rowNumber === anchor.row) || {};
    const generated = evaluateFilenamePattern(tokens, rowObj, anchor, anchor.colName);
    return {
      id: `item-${idx}`,
      rowNumber: anchor.row,
      targetName: generated,
      anchor,
    };
  });

  // Resolve duplicate collisions using policy
  const resolved = resolveDuplicates(rawItems, duplicatePolicy);

  const preparedItems: PreExtractionItem[] = rawItems.map((raw, idx) => {
    const res = resolved[idx];
    const isDup = res.isDuplicate;

    let status: PreExtractionItem['status'] = 'ready';
    let warningMessage: string | undefined = undefined;

    if (isDup) {
      if (duplicatePolicy === 'skip') {
        status = 'warning';
        warningMessage = 'Skipped due to duplicate filename policy.';
      } else {
        status = 'warning';
        warningMessage = `Duplicate detected. Renamed to "${res.finalName}".`;
      }
    }

    return {
      rowNumber: raw.rowNumber,
      cellRef: raw.anchor.cellRef,
      mediaColumn: raw.anchor.colName,
      originalExt: raw.anchor.ext,
      generatedFilename: res.finalName || raw.targetName,
      status,
      warningMessage,
      anchor: raw.anchor,
    };
  });

  const duplicateCount = preparedItems.filter(i => i.status === 'warning').length;

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-2xl font-bold text-slate-100">Step 5: Pre-Extraction Verification</h2>
        <p className="text-slate-400 text-sm">
          Review the list of generated filenames and choose how duplicate names should be handled.
        </p>
      </div>

      {/* Easy Language Guide Box */}
      <div className="bg-brand-500/10 border border-brand-500/30 rounded-2xl p-4 text-xs space-y-2 text-brand-200">
        <div className="flex items-center space-x-2 font-bold text-brand-300">
          <HelpCircle className="w-4 h-4 text-brand-400" />
          <span>💡 Quick Guide — How to complete Step 5</span>
        </div>
        <p className="text-slate-300">
          <strong>What to do:</strong> Scroll through the table to verify your filenames. If two photos end up with the exact same filename, select a <em>Duplicate Filename Policy</em> below so no photos are accidentally overwritten.
        </p>
        <p className="text-slate-300">
          <strong>Example Policy:</strong> Selecting <strong>Auto Suffix</strong> renames identical files to <code className="bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded font-mono">photo.jpg</code> and <code className="bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded font-mono">photo_2.jpg</code> automatically.
        </p>
      </div>

      {/* Duplicate Policy Configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Duplicate Filename Policy (Never Overwrite):
          </label>
          {duplicateCount > 0 && (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
              {duplicateCount} collision(s) detected
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label
            onClick={() => onUpdateDuplicatePolicy('auto-suffix')}
            className={`p-3.5 rounded-xl border cursor-pointer flex items-center space-x-3 transition-all ${
              duplicatePolicy === 'auto-suffix'
                ? 'border-brand-500 bg-brand-500/10 text-slate-100'
                : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
            }`}
          >
            <input
              type="radio"
              name="dupPolicy"
              checked={duplicatePolicy === 'auto-suffix'}
              onChange={() => onUpdateDuplicatePolicy('auto-suffix')}
              className="text-brand-500"
            />
            <div>
              <p className="text-xs font-semibold text-slate-200">Auto Suffix (Default)</p>
              <p className="text-[11px] text-slate-400">Adds numbers: `filename_2.jpg`, `filename_3.jpg`</p>
            </div>
          </label>

          <label
            onClick={() => onUpdateDuplicatePolicy('row-number')}
            className={`p-3.5 rounded-xl border cursor-pointer flex items-center space-x-3 transition-all ${
              duplicatePolicy === 'row-number'
                ? 'border-brand-500 bg-brand-500/10 text-slate-100'
                : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
            }`}
          >
            <input
              type="radio"
              name="dupPolicy"
              checked={duplicatePolicy === 'row-number'}
              onChange={() => onUpdateDuplicatePolicy('row-number')}
              className="text-brand-500"
            />
            <div>
              <p className="text-xs font-semibold text-slate-200">Append Row Number</p>
              <p className="text-[11px] text-slate-400">Adds Excel row: `filename_row14.jpg`</p>
            </div>
          </label>

          <label
            onClick={() => onUpdateDuplicatePolicy('skip')}
            className={`p-3.5 rounded-xl border cursor-pointer flex items-center space-x-3 transition-all ${
              duplicatePolicy === 'skip'
                ? 'border-brand-500 bg-brand-500/10 text-slate-100'
                : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
            }`}
          >
            <input
              type="radio"
              name="dupPolicy"
              checked={duplicatePolicy === 'skip'}
              onChange={() => onUpdateDuplicatePolicy('skip')}
              className="text-brand-500"
            />
            <div>
              <p className="text-xs font-semibold text-slate-200">Skip Duplicates</p>
              <p className="text-[11px] text-slate-400">Omits duplicated photos from export</p>
            </div>
          </label>
        </div>
      </div>

      {/* Pre-Extraction Items Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-brand-400" />
            Media Queue Preview ({preparedItems.length} items to export)
          </h4>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[360px]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-200 uppercase text-[10px] tracking-wider font-semibold sticky top-0">
              <tr>
                <th className="px-3 py-2.5">Row</th>
                <th className="px-3 py-2.5">Source Cell</th>
                <th className="px-3 py-2.5">Media Column</th>
                <th className="px-3 py-2.5">Generated Filename</th>
                <th className="px-3 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {preparedItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 font-mono">
                  <td className="px-3 py-2 text-slate-400">{item.rowNumber}</td>
                  <td className="px-3 py-2 text-brand-400 font-semibold">{item.cellRef}</td>
                  <td className="px-3 py-2 font-sans text-slate-300">{item.mediaColumn}</td>
                  <td className="px-3 py-2 text-emerald-400 font-semibold">{item.generatedFilename}</td>
                  <td className="px-3 py-2 font-sans">
                    {item.status === 'ready' ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Ready</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[11px]" title={item.warningMessage}>
                        <AlertTriangle className="w-3 h-3" />
                        <span>{duplicatePolicy === 'skip' ? 'Skipped' : 'Renamed'}</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
        >
          ← Back to Pattern Builder
        </button>

        <button
          onClick={() => onStartExtraction(preparedItems)}
          disabled={preparedItems.length === 0}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold text-sm transition-colors shadow-lg shadow-emerald-500/20 flex items-center space-x-2"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Execute Safe Extraction →</span>
        </button>
      </div>
    </div>
  );
};
