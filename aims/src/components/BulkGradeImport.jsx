import React, { useRef, useState } from 'react';
import { FileSpreadsheet, AlertCircle, CheckCircle2, Download, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import * as XLSX from 'xlsx';

export default function BulkGradeImport({ onImport, isProcessing }) {
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setSuccess(null);

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = event.target.result;
        // Parse the file (works for both Excel and CSV)
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Get the first worksheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (jsonData.length === 0) {
          throw new Error("File appears to be empty.");
        }

        // Normalize keys to lower case (e.g., "Entry_No" -> "entry_no")
        const normalizedData = jsonData.map(row => {
          const newRow = {};
          Object.keys(row).forEach(key => {
            // Remove extra spaces and convert to lowercase
            newRow[key.trim().toLowerCase()] = row[key];
          });
          return newRow;
        });

        // Basic Validation: Check if at least one key column exists
        const sampleRow = normalizedData[0];
        const hasEmail = sampleRow.hasOwnProperty('email') || sampleRow.hasOwnProperty('email address');
        const hasEntry = sampleRow.hasOwnProperty('entry_no') || sampleRow.hasOwnProperty('entry no');

        if (!hasEmail && !hasEntry) {
           throw new Error("File must contain an 'email' or 'entry_no' column.");
        }

        // Send parsed data back to parent
        const updatedCount = onImport(normalizedData);
        setSuccess(`Success! Processed ${updatedCount} records from '${sheetName}'.`);
        
        // Reset file input so you can upload the same file again if needed
        if (fileInputRef.current) fileInputRef.current.value = '';

      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to parse file.");
      }
    };

    reader.onerror = () => setError("Failed to read file.");
    
    // Read as binary string (required for 'xlsx' library)
    reader.readAsBinaryString(file);
  };

  // Helper to download a template
  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { email: "student@example.com", grade: "A", attendance: 85 },
      { email: "student2@example.com", grade: "B+", attendance: 70 },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "grade_template.xlsx");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          // Accept Excel and CSV formats
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          className="hidden"
        />
        
        <Button 
          variant="outline" 
          onClick={() => {
             if (fileInputRef.current) fileInputRef.current.value = '';
             fileInputRef.current?.click();
          }}
          disabled={isProcessing}
          className="gap-2 bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
        >
          <FileSpreadsheet size={16} className="text-green-600" />
          Import Excel / CSV
        </Button>

        <Button
          variant="ghost"
          size="icon"
          title="Download Template"
          onClick={downloadTemplate}
          className="text-slate-400 hover:text-slate-600"
        >
          <Download size={16} />
        </Button>
      </div>

      {/* Helper Text */}
      <div className="text-[10px] text-slate-400">
        Supports .xlsx, .csv • Columns: email, grade, attendance
      </div>

      {/* Feedback Messages */}
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="py-2 border-green-200 bg-green-50 text-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-xs">{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}