'use client'

import { useState, useRef } from 'react';
import { uploadToGCS } from '../actions';

export default function FileUploadForm() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const file = formData.get('file') as File;
    
    if (!file || file.size === 0) {
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }

    setUploading(true);
    setMessage(null);
    setUploadedUrl(null);

    try {
      const result = await uploadToGCS(formData);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'File uploaded successfully!' });
        setUploadedUrl(result.url || null);
        formRef.current?.reset();
      } else {
        setMessage({ type: 'error', text: result.error || 'Upload failed' });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'An error occurred during upload' 
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="w-full">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-2">
          <label 
            htmlFor="file" 
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Select file to upload
          </label>
          <input
            type="file"
            id="file"
            name="file"
            disabled={uploading}
            className="block w-full text-sm text-zinc-900 border border-zinc-300 rounded-lg cursor-pointer bg-zinc-50 dark:text-zinc-400 focus:outline-none dark:bg-zinc-900 dark:border-zinc-600 dark:placeholder-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-zinc-900 file:text-zinc-50 dark:file:bg-zinc-50 dark:file:text-zinc-900 hover:file:bg-zinc-800 dark:hover:file:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {uploading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </>
          ) : (
            'Upload to GCS'
          )}
        </button>
      </form>

      {/* Status Messages */}
      {message && (
        <div className={`mt-4 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Uploaded File URL */}
      {uploadedUrl && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
            File URL:
          </p>
          <a 
            href={uploadedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
          >
            {uploadedUrl}
          </a>
        </div>
      )}
    </div>
  );
}
