import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, ShieldAlert, AlertCircle, HelpCircle } from 'lucide-react';
import { parseExcelWorkbook } from '../lib/ooxml/parser';
import { ParsedWorkbook } from '../types';
import { UniqueProcessingLoader } from './UniqueProcessingLoader';

interface Step1Props {
  onWorkbookParsed: (wb: ParsedWorkbook) => void;
}

export const Step1_FileUpload: React.FC<Step1Props> = ({ onWorkbookParsed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('Reading workbook archive...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setErrorMessage('Please select a valid Excel workbook (.xlsx file format).');
      return;
    }

    setIsLoading(true);
    setLoadingStatus('Unpacking workbook archive...');
    setErrorMessage(null);

    try {
      const buffer = await file.arrayBuffer();
      const wb = await parseExcelWorkbook(buffer, file.name, (statusMsg) => {
        setLoadingStatus(statusMsg);
      });

      if (!wb || wb.sheets.length === 0) {
        throw new Error('No worksheets found in workbook. Please ensure the Excel file is not corrupt or encrypted.');
      }

      onWorkbookParsed(wb);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse workbook. Please check file format and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-2xl font-bold text-slate-100">Step 1: Upload Your Excel File</h2>
        <p className="text-slate-400 text-sm">
          Select or drag your `.xlsx` Excel spreadsheet containing embedded photos or images.
        </p>
      </div>

      {/* Easy Language Guide Box */}
      <div className="bg-brand-500/10 border border-brand-500/30 rounded-2xl p-4 text-xs space-y-2 text-brand-200">
        <div className="flex items-center space-x-2 font-bold text-brand-300">
          <HelpCircle className="w-4 h-4 text-brand-400" />
          <span>💡 Quick Guide — How to complete Step 1</span>
        </div>
        <p className="text-slate-300">
          <strong>What to do:</strong> Click the box below to pick an Excel file from your computer, or drag and drop the file onto the box.
        </p>
        <p className="text-slate-300">
          <strong>Example:</strong> If you have an Excel log named <code className="bg-slate-800 text-brand-300 px-1.5 py-0.5 rounded">Surveillance_Log_2026.xlsx</code> with pictures inside, drop it here.
        </p>
      </div>

      {isLoading ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <UniqueProcessingLoader message={loadingStatus} subtext="Parsing spreadsheet XML & media anchor positions..." />
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isLoading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
              : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx"
            className="hidden"
            disabled={isLoading}
          />

          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div>
              <p className="text-base font-semibold text-slate-200">
                Drop your Excel file (.xlsx) here
              </p>
              <p className="text-xs text-slate-400 mt-1">
                or click anywhere in this box to browse files
              </p>
            </div>

            <div className="inline-flex items-center space-x-2 text-xs font-medium text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/50">
              <FileSpreadsheet className="w-3.5 h-3.5 text-brand-400" />
              <span>Accepts .xlsx workbooks with embedded photos or documents</span>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-3 shadow-lg">
          <AlertCircle className="w-6 h-6 flex-shrink-0 text-rose-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-rose-200">File Processing Error</p>
            <p className="text-xs text-rose-300">{errorMessage}</p>
            <p className="text-xs text-rose-400 font-medium pt-1">
              💡 Advice: Please verify that the file is an unencrypted `.xlsx` workbook and try again.
            </p>
          </div>
        </div>
      )}

      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>Security & Confidentiality Guarantee</span>
        </div>
        <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
          <li><strong>Zero Cloud Upload:</strong> Your spreadsheet is opened locally inside your web browser. No files are uploaded to any server.</li>
          <li><strong>Complete Privacy:</strong> Your photos, cell text, and timestamps remain 100% confidential.</li>
        </ul>
      </div>
    </div>
  );
};
