import React from 'react';
import { SheetSummary, ExtractedMediaAnchor } from '../types';
import { Image, CheckSquare, Square, Table, AlertTriangle, HelpCircle } from 'lucide-react';

interface Step3Props {
  sheet: SheetSummary;
  anchors: ExtractedMediaAnchor[];
  selectedMediaColumns: string[];
  onToggleColumn: (colName: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3_ColumnMap: React.FC<Step3Props> = ({
  sheet,
  anchors,
  selectedMediaColumns,
  onToggleColumn,
  onNext,
  onBack,
}) => {
  // Count media anchors per column header
  const mediaCountByHeader = new Map<string, number>();
  for (const a of anchors) {
    const current = mediaCountByHeader.get(a.colName) || 0;
    mediaCountByHeader.set(a.colName, current + 1);
  }

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-2xl font-bold text-slate-100">Step 3: Select Media Columns</h2>
        <p className="text-slate-400 text-sm">
          Choose which column(s) in your spreadsheet contain the photos you want to extract.
        </p>
      </div>

      {/* Easy Language Guide Box */}
      <div className="bg-brand-500/10 border border-brand-500/30 rounded-2xl p-4 text-xs space-y-2 text-brand-200">
        <div className="flex items-center space-x-2 font-bold text-brand-300">
          <HelpCircle className="w-4 h-4 text-brand-400" />
          <span>💡 Quick Guide — How to complete Step 3</span>
        </div>
        <p className="text-slate-300">
          <strong>What to do:</strong> Click the check boxes for the column names that contain your pictures. Green numbers show how many photos were found in each column.
        </p>
        <p className="text-slate-300">
          <strong>Example:</strong> If your spreadsheet has photos in <code className="bg-slate-800 text-brand-300 px-1.5 py-0.5 rounded">Detected Face</code> and <code className="bg-slate-800 text-brand-300 px-1.5 py-0.5 rounded">POI Image</code>, check both column boxes to extract images from both!
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <Image className="w-4 h-4 text-brand-400" />
          Spreadsheet Columns ({sheet.headers.length}):
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {sheet.headers.map((hName) => {
            const count = mediaCountByHeader.get(hName) || 0;
            const isSelected = selectedMediaColumns.includes(hName);

            return (
              <div
                key={hName}
                onClick={() => onToggleColumn(hName)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                  isSelected
                    ? 'border-brand-500 bg-brand-500/10 shadow-md shadow-brand-500/5'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 text-brand-400">
                    {isSelected ? <CheckSquare className="w-5 h-5 text-brand-400" /> : <Square className="w-5 h-5 text-slate-600" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200 text-sm">{hName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {count > 0 ? `${count} embedded photos` : 'No media detected'}
                    </p>
                  </div>
                </div>

                {count > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {count} photos
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sample Row Preview Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Table className="w-4 h-4 text-brand-400" />
            Sample Row Preview (First {Math.min(sheet.sampleRows.length, 5)} rows)
          </h4>
          <span className="text-xs text-slate-400">
            Total {sheet.rowCount} rows detected
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-200 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="px-3 py-2.5">Row</th>
                {sheet.headers.slice(0, 6).map((h, idx) => (
                  <th key={idx} className="px-3 py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {sheet.sampleRows.slice(0, 5).map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/40">
                  <td className="px-3 py-2 font-mono text-slate-400">{row._rowNumber}</td>
                  {sheet.headers.slice(0, 6).map((h, cIdx) => {
                    const val = row[h];
                    const isMediaCol = selectedMediaColumns.includes(h);
                    const mediaInCell = anchors.find(a => a.row === row._rowNumber && a.colName === h);

                    return (
                      <td key={cIdx} className={`px-3 py-2 ${isMediaCol ? 'bg-brand-500/5 font-medium' : ''}`}>
                        {mediaInCell ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[11px] border border-emerald-500/20">
                            <Image className="w-3 h-3" />
                            <span>Media ({mediaInCell.ext})</span>
                          </span>
                        ) : (
                          <span className="truncate max-w-[150px] inline-block font-mono text-slate-300">
                            {val !== undefined && val !== null ? String(val) : '—'}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedMediaColumns.length === 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Please select at least one media column to continue.</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
        >
          ← Back to Sheet Select
        </button>

        <button
          onClick={onNext}
          disabled={selectedMediaColumns.length === 0}
          className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium text-sm transition-colors shadow-lg shadow-brand-500/20"
        >
          Build Filename Pattern →
        </button>
      </div>
    </div>
  );
};
