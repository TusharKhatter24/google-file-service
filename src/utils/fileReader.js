/**
 * Browser-based file reading utilities
 * Reads files directly in the browser without uploading to server
 */

import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
// For Vite: use the worker file from public folder (served at root)
// This works in both development and production builds
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

/**
 * Read text content from a file
 * @param {File} file - File object from input
 * @returns {Promise<string>} Text content
 */
export const readTextFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * Read file as data URL (for images, etc.)
 * @param {File} file - File object from input
 * @returns {Promise<string>} Data URL
 */
export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Read file as array buffer (for binary files)
 * @param {File} file - File object from input
 * @returns {Promise<ArrayBuffer>} Array buffer
 */
export const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Extract text from PDF file using pdf.js
 * @param {File} file - PDF file object
 * @returns {Promise<string>} Extracted text content
 */
export const extractTextFromPDF = async (file) => {
  try {
    console.log('Starting PDF extraction for:', file.name);
    const arrayBuffer = await readFileAsArrayBuffer(file);
    console.log('PDF file loaded, size:', arrayBuffer.byteLength, 'bytes');
    
    // Load PDF document with error handling
    let pdf;
    try {
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0 // Reduce console noise
      });
      pdf = await loadingTask.promise;
    } catch (loadError) {
      console.error('PDF loading error:', loadError);
      const errorMessage = loadError?.message || String(loadError);
      
      // Check if it's a worker issue
      if (errorMessage.includes('worker') || errorMessage.includes('Worker') || errorMessage.includes('Failed to fetch')) {
        // Try CDN fallback
        const pdfjsVersion = pdfjsLib.version || '5.4.449';
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;
        console.log('Retrying with CDN worker...');
        
        // Retry once with CDN worker
        try {
          const retryTask = pdfjsLib.getDocument({ data: arrayBuffer, verbosity: 0 });
          pdf = await retryTask.promise;
        } catch (retryError) {
          throw new Error('PDF.js worker failed to load. Please refresh the page and try again.');
        }
      } else {
        throw loadError;
      }
    }
    
    const { numPages } = pdf;
    console.log(`PDF loaded successfully, ${numPages} pages`);
    
    if (numPages === 0) {
      throw new Error('PDF appears to be empty or corrupted.');
    }
    
    let fullText = '';
    let pagesWithText = 0;

    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Extract text items
        const pageText = textContent.items
          .map((item) => {
            // Handle both 'str' property and text content
            return item.str || item.text || '';
          })
          .filter(text => text.trim().length > 0) // Remove empty strings
          .join(' ');
        
        if (pageText.trim().length > 0) {
          fullText += pageText + '\n\n';
          pagesWithText++;
        }
        
        console.log(`Extracted text from page ${pageNum}/${numPages} (${pageText.length} chars)`);
      } catch (pageError) {
        console.warn(`Error extracting text from page ${pageNum}:`, pageError);
        // Continue with other pages even if one fails
        fullText += `\n[Note: Could not extract text from page ${pageNum} - may be image-based]\n\n`;
      }
    }

    const result = fullText.trim();
    
    // Warn if no text was found but don't fail completely
    if (!result || pagesWithText === 0) {
      throw new Error(
        'No text content found in PDF. ' +
        'The PDF might be image-based (scanned document) or contain only images. ' +
        'For image-based PDFs, OCR (Optical Character Recognition) would be needed.'
      );
    }
    
    console.log(`PDF extraction completed successfully: ${pagesWithText}/${numPages} pages contained text`);
    return result;
  } catch (error) {
    console.error('PDF extraction error:', error);
    const { message, name } = error;
    
    // Provide more specific error messages
    if (name === 'InvalidPDFException' || (message && message.includes('Invalid PDF'))) {
      throw new Error('Invalid PDF file. Please ensure the file is a valid, unencrypted PDF.');
    } else if (message && (message.includes('password') || message.includes('encrypted') || message.includes('encryption'))) {
      throw new Error('PDF is password-protected or encrypted. Please provide an unencrypted PDF.');
    } else if (message && message.includes('worker')) {
      throw new Error('PDF.js worker failed to load. Please refresh the page and try again.');
    } else if (message && message.includes('image-based')) {
      // Re-throw image-based PDF errors as-is
      throw error;
    } else {
      throw new Error(`Failed to extract text from PDF: ${message || 'Unknown error'}`);
    }
  }
};

/**
 * Extract text content from various file types
 * @param {File} file - File object from input
 * @returns {Promise<string>} Extracted text content
 */
export const extractTextFromFile = async (file) => {
  const mimeType = file.type || '';
  const fileName = file.name.toLowerCase();

  // PDF files - use pdf.js library
  if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return await extractTextFromPDF(file);
  }

  // Text files
  if (
    mimeType.startsWith('text/') ||
    mimeType === 'application/json' ||
    fileName.endsWith('.txt') ||
    fileName.endsWith('.md') ||
    fileName.endsWith('.markdown') ||
    fileName.endsWith('.json') ||
    fileName.endsWith('.csv') ||
    fileName.endsWith('.html') ||
    fileName.endsWith('.htm') ||
    fileName.endsWith('.xml') ||
    fileName.endsWith('.js') ||
    fileName.endsWith('.jsx') ||
    fileName.endsWith('.ts') ||
    fileName.endsWith('.tsx') ||
    fileName.endsWith('.css') ||
    fileName.endsWith('.scss') ||
    fileName.endsWith('.yaml') ||
    fileName.endsWith('.yml')
  ) {
    return await readTextFile(file);
  }

  // DOCX files - basic extraction
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    throw new Error('DOCX files require special parsing. Please convert to PDF or TXT format, or use a library like mammoth.js');
  }

  // Images - cannot extract text directly
  if (mimeType.startsWith('image/')) {
    throw new Error('Image files cannot be directly converted to text. Please use OCR tools or provide a text version.');
  }

  // Unknown file type
  throw new Error(`Unsupported file type: ${mimeType || 'unknown'}. Supported types: text files (.txt, .md, .json, etc.)`);
};

