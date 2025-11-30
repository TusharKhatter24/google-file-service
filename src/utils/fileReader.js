/**
 * Browser-based file reading utilities
 * Reads files directly in the browser without uploading to server
 */

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
 * Extract text content from various file types
 * @param {File} file - File object from input
 * @returns {Promise<string>} Extracted text content
 */
export const extractTextFromFile = async (file) => {
  const mimeType = file.type || '';
  const fileName = file.name.toLowerCase();

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

  // PDF files - throw error to indicate we need Gemini API or pdf.js
  // PDFs require special handling - either use Gemini API or pdf.js library
  if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
    throw new Error('PDF_EXTRACTION_NEEDED');
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

