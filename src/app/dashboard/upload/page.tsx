"use client";

import { useState } from "react";
import { UploadCloud, File, X, CheckCircle, AlertCircle } from "lucide-react";

export default function UploadContentPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState("");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndSetFile = (selectedFile: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(selectedFile.type)) {
      setErrorMsg("Invalid file type. Only PDF, JPG, and PNG are allowed.");
      return false;
    }
    
    if (selectedFile.size > maxSize) {
      setErrorMsg("File is too large. Maximum size is 10MB.");
      return false;
    }

    setFile(selectedFile);
    setErrorMsg("");
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg("Please select a file to upload.");
      return;
    }

    setUploadStatus('uploading');
    
    // Simulate API upload
    setTimeout(() => {
      setUploadStatus('success');
      setFile(null);
      setTimeout(() => setUploadStatus('idle'), 3000); // Reset after 3s
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Upload Content</h1>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm">
        
        {uploadStatus === 'success' ? (
          <div className="text-center py-16 px-4 animate-in zoom-in duration-300">
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Successful!</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Your upload has been submitted and is currently <span className="font-bold text-yellow-600">under review</span>. It will be publicly visible once approved.
            </p>
            <button 
              onClick={() => setUploadStatus('idle')}
              className="mt-8 px-6 py-2 bg-green-100 text-green-700 font-semibold rounded-full hover:bg-green-200 transition-colors"
            >
              Upload Another File
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Title <span className="text-red-500">*</span></label>
                <input required type="text" placeholder="e.g. Discrete Math Midterm 2023" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all" />
              </div>

              {/* Content Type */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Content Type <span className="text-red-500">*</span></label>
                <select required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all appearance-none cursor-pointer">
                  <option value="" disabled selected>Select type</option>
                  <option value="question">Question Bank</option>
                  <option value="assignment">Assignment</option>
                  <option value="notes">Notes</option>
                  <option value="slides">Slides</option>
                  <option value="lab">Lab Materials</option>
                </select>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Department <span className="text-red-500">*</span></label>
                <select required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all appearance-none cursor-pointer">
                  <option value="CSE">CSE</option>
                  <option value="SWE">SWE</option>
                  <option value="BBA">BBA</option>
                  <option value="EEE">EEE</option>
                </select>
              </div>

              {/* Semester */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Semester <span className="text-red-500">*</span></label>
                <select required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all appearance-none cursor-pointer">
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                </select>
              </div>
            </div>

            {/* Course */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Course Name <span className="text-red-500">*</span></label>
              <input required type="text" placeholder="e.g. Structured Programming" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Description (Optional)</label>
              <textarea rows={3} placeholder="Add any extra details, like which topics are covered..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"></textarea>
            </div>

            {/* File Upload Area */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Attach File <span className="text-red-500">*</span></label>
              
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  isDragging ? 'border-green-500 bg-green-50' : 
                  file ? 'border-green-300 bg-green-50/30' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
                
                {file ? (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                      <File size={32} className="text-green-600" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 line-clamp-1">{file.name}</span>
                      <span className="text-gray-400 text-sm">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setFile(null)}
                      className="text-red-500 text-sm font-medium hover:text-red-600 flex items-center gap-1"
                    >
                      <X size={14} /> Remove file
                    </button>
                  </div>
                ) : (
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 bg-white rounded-full shadow-sm border border-gray-100">
                      <UploadCloud size={32} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">Click to upload or drag and drop</p>
                      <p className="text-gray-500 text-sm mt-1">PDF, JPG, PNG (Max 10MB)</p>
                    </div>
                  </label>
                )}
              </div>
              
              {errorMsg && (
                <div className="flex items-center gap-2 text-red-500 text-sm font-medium mt-2">
                  <AlertCircle size={16} /> {errorMsg}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                disabled={uploadStatus === 'uploading' || !file}
                className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${
                  uploadStatus === 'uploading' 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : !file
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                }`}
              >
                {uploadStatus === 'uploading' ? (
                  <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></span> Uploading...</>
                ) : (
                  <>Submit for Review</>
                )}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
