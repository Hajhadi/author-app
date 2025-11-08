import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PdfViewer = ({ contentId }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [fileUrl, setFileUrl] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/user/content/${contentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch PDF');
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setFileUrl(url);
      } catch (err) {
        setError('Unable to load PDF');
      }
    };
    fetchPdf();
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [contentId]);

  function onDocumentLoadSuccess({ numPages: loadedPages }) {
    setNumPages(loadedPages);
    setPageNumber(1);
  }

  return (
    <div className="w-full h-full overflow-auto flex flex-col items-center">
      {error && <p className="text-red-500">{error}</p>}
      {fileUrl && (
        <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} className="shadow-lg">
          <Page pageNumber={pageNumber} />
        </Document>
      )}
      {numPages && (
        <div className="py-4 flex items-center gap-2">
          <p>
            Page {pageNumber} of {numPages}
          </p>
          <button
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((prev) => prev - 1)}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber((prev) => prev + 1)}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;
