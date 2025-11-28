import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate a PDF from Quill editor content
 * @param {string} htmlContent - HTML content from Quill editor
 * @param {string} fileName - Name for the PDF file
 * @returns {Promise<File>} PDF file
 */
export const generatePDFFromHTML = async (htmlContent, fileName = 'notes.pdf') => {
  try {
    // Create a temporary container to render the HTML
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '210mm'; // A4 width
    tempContainer.style.padding = '20mm';
    tempContainer.style.backgroundColor = '#ffffff';
    tempContainer.style.fontFamily = 'Arial, sans-serif';
    tempContainer.style.fontSize = '12px';
    tempContainer.style.lineHeight = '1.6';
    tempContainer.style.color = '#000000';
    
    // Set innerHTML with the Quill content
    tempContainer.innerHTML = htmlContent;
    
    // Append to body temporarily
    document.body.appendChild(tempContainer);
    
    // Wait for images to load if any
    const images = tempContainer.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          // Timeout after 5 seconds
          setTimeout(() => reject(new Error('Image load timeout')), 5000);
        });
      })
    );
    
    // Convert to canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: tempContainer.scrollWidth,
      height: tempContainer.scrollHeight,
    });
    
    // Remove temporary container
    document.body.removeChild(tempContainer);
    
    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;
    
    // Add first page
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Convert PDF to blob/file
    const pdfBlob = pdf.output('blob');
    const pdfFile = new File([pdfBlob], fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`, {
      type: 'application/pdf',
    });
    
    return pdfFile;
  } catch (error) {
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

