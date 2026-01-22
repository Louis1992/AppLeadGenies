
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, FileUp, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReportUpload({ onGenerate }) {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 5); // Limit auf 5 Dateien
    setFiles(selectedFiles);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    const selectedFiles = Array.from(e.dataTransfer.files).slice(0, 5);
    setFiles(selectedFiles);
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div className="clay-card p-8 text-center">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <motion.div
        whileHover={{ scale: 1.05 }}
        onClick={triggerFileSelect}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300/70 rounded-2xl p-12 cursor-pointer"
      >
        <FileUp className="w-16 h-16 text-gray-700 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">CSV-Tagesberichte hochladen</h2>
        <p className="text-gray-600 mt-2">
          Ziehen Sie bis zu 5 CSV-Dateien hierher oder klicken Sie, um sie auszuwählen.
        </p>
      </motion.div>

      {files.length > 0 && (
        <div className="mt-6 text-left">
          <h3 className="font-semibold text-gray-800 mb-3">Ausgewählte Dateien:</h3>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="clay-element p-3 rounded-lg flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{file.name}</span>
                <span className="text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button 
        onClick={() => onGenerate(files)} 
        disabled={files.length === 0}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-12 py-7 text-lg mt-8 rounded-lg shadow-md hover:shadow-lg transition-all"
      >
        <Upload className="w-6 h-6 mr-3" />
        Report generieren
      </Button>
    </div>
  );
}
