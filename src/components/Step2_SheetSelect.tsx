import React, { useState } from 'react';
import { ParsedWorkbook, SheetSummary } from '../types';
import { Layers, Image, CheckCircle2, HelpCircle, AlertTriangle, Search, CheckSquare, Square } from 'lucide-react';

interface Step2Props {
  workbook: ParsedWorkbook;
  selectedSheetNames: string[];
  onSelectSheets: (sheetNames: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2_SheetSelect: React.FC<Step2Props> = ({
  workbook,
  selectedSheetNames,
  onSelectSheets,
  onNext,
  onBack,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const hasSheets = workbook && workbook.sheets && workbook.sheets.length > 0;

  const filteredSheets = hasSheets
    ? workbook.sheets.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const handleToggleSheet = (sheetName: string) => {
    if (selectedSheetNames.includes(sheetName)) {
      onSelectSheets(selectedSheetNames.filter(s => s !== sheetName));
    } else {
      onSelectSheets([...selectedSheetNames, sheetName]);
    }
  };

  const handleSelectAll = () => {
    if (selectedSheetNames.length === workbook.sheets.length) {
      onSelectSheets([]);
    } else {
      onSelectSheets(workbook.sheets.map(s => s.name));
    }
  };

  const totalSelectedImages = workbook
    ? workbook.sheets
        .filter(s => selectedSheetNames.includes(s.name))
        .reduce((sum, s) => sum + s.imageCount, 0)
    : 0;

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-2xl font-bold text-slate-100">Step 2: Choose Worksheets / Workbooks</h2>
        <p className="text-slate-400 text-sm">
          Select worksheets to extract media from. Multiple sheets can be selected simultaneously for batch extraction.
        </p>
      </div>

      {/* Easy Language Guide Box */}
      <div className="bg-brand-500/10 border border-brand-500/30 rounded-2xl p-4 text-xs space-y-2 text-brand-200">
        <div className="flex items-center space-x-2 font-bold text-brand-300">
          <HelpCircle className="w-4 h-4 text-brand-400" />
          <span>💡 Quick Guide — Multi-Sheet / Multi-Workbook Batch Selection</span>
        </div>
        <p className="text-slate-300">
          <strong>What to do:</strong> Click on individual worksheets or click <strong>Select All Worksheets</strong> to include all tabs across all uploaded Excel files.
        </p>
      </div>

      {!hasSheets ? (
        <div className="p-8 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-center space-y-4 max-w-xl mx-auto">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-slate-100">No Worksheets Found</h3>
            <p className="text-xs text-amber-200 mt-1">
              No readable worksheets were found. The files may be empty or encrypted.
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors shadow-lg"
          >
            ← Select Other Files
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search sheets or workbooks..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
              <button
                onClick={handleSelectAll}
                className="inline-flex items-center space-x-2 text-xs font-semibold text-brand-300 hover:text-brand-200 bg-brand-500/10 border border-brand-500/30 px-3 py-1.5 rounded-xl transition-colors"
              >
                {selectedSheetNames.length === workbook.sheets.length ? (
                  <CheckSquare className="w-4 h-4 text-brand-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>Select All ({workbook.sheets.length} Sheets)</span>
              </button>

              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                {selectedSheetNames.length} selected ({totalSelectedImages} media objects)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-1">
            {filteredSheets.map((sheet: SheetSummary) => {
              const isSelected = selectedSheetNames.includes(sheet.name);
              return (
                <div
                  key={sheet.name}
                  onClick={() => handleToggleSheet(sheet.name)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/5'
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-xl border ${
                        isSelected ? 'bg-brand-500/20 border-brand-500/30 text-brand-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-100 flex items-center gap-2 text-xs sm:text-sm">
                          {sheet.name}
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-400" />}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {sheet.rowCount.toLocaleString()} rows • {sheet.columnCount} cols
                        </p>
                      </div>
                    </div>

                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${
                      sheet.hasImages
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    }`}>
                      <Image className="w-3.5 h-3.5" />
                      <span>{sheet.imageCount} media</span>
                    </div>
                  </div>

                  {sheet.headers && sheet.headers.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80">
                      <p className="text-xs font-medium text-slate-400 mb-2">Detected Headers:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {sheet.headers.slice(0, 5).map((h, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] bg-slate-800/80 border border-slate-700/60 text-slate-300 px-2 py-0.5 rounded-md truncate max-w-[140px]"
                          >
                            {h}
                          </span>
                        ))}
                        {sheet.headers.length > 5 && (
                          <span className="text-[11px] text-slate-500 px-1 py-0.5">
                            +{sheet.headers.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
        >
          ← Change Files
        </button>

        <button
          onClick={onNext}
          disabled={!hasSheets || selectedSheetNames.length === 0}
          className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium text-sm transition-colors shadow-lg shadow-brand-500/20"
        >
          Continue to Column Selection ({selectedSheetNames.length} Sheets) →
        </button>
      </div>
    </div>
  );
};
