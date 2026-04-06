/**
 * TextCleaner utility for cleaning extracted document text.
 * Implements FR-005 (SCRUM-13673): Basic Text Cleaning
 */

/**
 * Removes null bytes from text.
 */
function removeNullBytes(text: string): string {
  return text.replace(/\0/g, '');
}

/**
 * Removes control characters (except newlines and tabs).
 */
function removeControlCharacters(text: string): string {
  // Remove control characters (0x00-0x1F and 0x7F) except \t (0x09), \n (0x0A), \r (0x0D)
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Removes common PDF/DOCX formatting artifacts.
 */
function removeFormattingArtifacts(text: string): string {
  // Remove form feed characters (common in PDFs)
  let cleaned = text.replace(/\f/g, '\n');

  // Remove soft hyphens (used for word-wrap in PDFs/DOCX)
  cleaned = cleaned.replace(/\u00AD/g, '');

  // Remove zero-width spaces and other invisible Unicode characters
  cleaned = cleaned.replace(/[\u200B\u200C\u200D\uFEFF]/g, '');

  // Remove non-breaking spaces and replace with regular spaces
  cleaned = cleaned.replace(/\u00A0/g, ' ');

  // Remove repeated dashes/underscores used as separators (3 or more)
  cleaned = cleaned.replace(/[-_]{3,}/g, '');

  // Remove common PDF header/footer artifacts like page numbers on their own line
  // e.g., lines that are just numbers (page numbers)
  cleaned = cleaned.replace(/^\s*\d+\s*$/gm, '');

  return cleaned;
}

/**
 * Normalizes whitespace in text.
 */
function normalizeWhitespace(text: string): string {
  // Normalize Windows-style line endings to Unix
  let cleaned = text.replace(/\r\n/g, '\n');

  // Normalize carriage returns to newlines
  cleaned = cleaned.replace(/\r/g, '\n');

  // Replace tabs with a single space
  cleaned = cleaned.replace(/\t/g, ' ');

  // Collapse multiple spaces into a single space (but not newlines)
  cleaned = cleaned.replace(/[ ]{2,}/g, ' ');

  // Collapse more than 2 consecutive newlines into 2
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Trim leading/trailing whitespace from each line
  cleaned = cleaned
    .split('\n')
    .map((line) => line.trim())
    .join('\n');

  return cleaned;
}

/**
 * Removes non-printable Unicode characters outside the basic printable range,
 * while preserving common extended Latin characters and standard punctuation.
 */
function removeNonPrintable(text: string): string {
  // Keep printable ASCII (0x20-0x7E), newlines, and common extended characters (0x80-0xFF)
  // Remove anything in the private use area or other non-printable Unicode blocks
  return text.replace(/[\uE000-\uF8FF\uFFF0-\uFFFF]/g, '');
}

/**
 * Cleans raw extracted text from PDF, DOCX, or TXT files.
 * Removes null bytes, control characters, formatting artifacts,
 * and normalizes whitespace.
 *
 * @param rawText - The raw text string to clean
 * @returns The cleaned text string
 */
export function clean(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') {
    return '';
  }

  let cleaned = rawText;

  cleaned = removeNullBytes(cleaned);
  cleaned = removeControlCharacters(cleaned);
  cleaned = removeFormattingArtifacts(cleaned);
  cleaned = removeNonPrintable(cleaned);
  cleaned = normalizeWhitespace(cleaned);

  return cleaned.trim();
}