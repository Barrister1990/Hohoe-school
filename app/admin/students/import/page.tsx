'use client';

import { ArrowLeft, Download, FileText, Loader2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAlert } from '@/components/shared/AlertProvider';

export default function ImportStudentsPage() {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // In a real app, you would parse the CSV/Excel file here
      // For now, we'll just show a message
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      // Simulate file upload and processing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      showSuccess('Students imported successfully!');
      router.push('/admin/students');
    } catch (error) {
      console.error('Failed to import students:', error);
      showError('Failed to import students. Please check the file format.');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create a CSV template
    const csvContent = 'First Name,Middle Name,Last Name,Date of Birth,Gender,Class,Parent Name,Parent Phone,Address\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full min-w-0 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl md:text-3xl font-semibold text-gray-900">Import Students</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            Bulk import students from CSV or Excel file
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6">
        <h2 className="text-sm md:text-base font-semibold text-blue-900 mb-2">Import Instructions</h2>
        <ul className="text-xs md:text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Download the template file to ensure correct format</li>
          <li>Fill in student information in the template</li>
          <li>Upload the completed file (CSV or Excel format)</li>
          <li>Review the preview before confirming import</li>
        </ul>
      </div>

      {/* Template Download */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">Download Template</h3>
            <p className="text-xs md:text-sm text-gray-600">
              Use this template to ensure your data is formatted correctly
            </p>
          </div>
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Template
          </button>
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">Upload File</h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-8 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            id="file-upload"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            <div className="p-3 bg-gray-100 rounded-lg">
              <Upload className="h-8 w-8 md:h-10 md:w-10 text-gray-600" />
            </div>
            <div>
              <p className="text-sm md:text-base font-medium text-gray-900">
                Click to upload or drag and drop
              </p>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                CSV or Excel files only
              </p>
            </div>
          </label>
        </div>

        {file && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-600">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Preview (if file selected) */}
      {file && preview.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">
            Preview ({preview.length} students)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">First Name</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Last Name</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">Class</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {preview.slice(0, 5).map((student, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2">{student.firstName}</td>
                    <td className="px-3 py-2">{student.lastName}</td>
                    <td className="px-3 py-2">{student.class}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 5 && (
              <p className="text-xs text-gray-600 mt-2 text-center">
                ... and {preview.length - 5} more
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => router.back()}
          className="px-4 md:px-6 py-2 text-sm md:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="px-4 md:px-6 py-2 text-sm md:text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Import Students
            </>
          )}
        </button>
      </div>
    </div>
  );
}

