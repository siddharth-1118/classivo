import React, { useState, useCallback } from 'react';
import { Upload, X, File } from 'lucide-react';

interface FileUploadFormProps {
  onUpload: (formData: FormData) => Promise<void>;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  description?: string;
}

export default function FileUploadForm({ onUpload, accept = "*", maxSizeMB = 10, label = "Upload File", description }: FileUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const clearFile = () => setFile(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await onUpload(formData);
      setFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <div className="card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{label}</h3>
      {description && <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>{description}</p>}

      {!file ? (
        <div 
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{ 
            border: `2px dashed ${dragActive ? 'var(--accent)' : 'var(--border-subtle)'}`,
            borderRadius: '12px',
            padding: '40px 20px',
            textAlign: 'center',
            background: dragActive ? 'rgba(var(--accent-rgb), 0.05)' : 'transparent',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          <input 
            type="file" 
            onChange={handleFileChange} 
            accept={accept}
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
          />
          <div style={{ color: 'var(--accent)', marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
            <Upload size={32} />
          </div>
          <p style={{ fontSize: '15px', fontWeight: '500', marginBottom: '4px' }}>Click or drag a file here</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Max file size: {maxSizeMB}MB</p>
        </div>
      ) : (
        <div style={{ 
          background: 'rgba(255,255,255,0.02)', 
          borderRadius: '12px', 
          padding: '16px', 
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ padding: '8px', background: 'var(--bg-base)', borderRadius: '8px', color: 'var(--accent)' }}>
            <File size={20} />
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
          <button onClick={clearFile} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
      )}

      <button 
        className="btn btn-primary btn-full" 
        onClick={handleSubmit} 
        disabled={!file || loading}
        style={{ marginTop: '20px' }}
      >
        {loading ? <div className="spinner" /> : <Upload size={18} />}
        {loading ? 'Uploading...' : 'Upload Now'}
      </button>
    </div>
  );
}
