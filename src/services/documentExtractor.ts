src/services/documentExtractor.ts

```typescript
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { clean } from '../utils/textCleaner';

// Configure pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

const MAX_RETRIES = 2;

async function extractFromPdf(file: File, attempt: number = 0): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const textParts: string[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => {
          if ('str' in item) {
            return item.str;
          }
          return '';
        })
        .join(' ');
      textParts.push(pageText);
    }

    return textParts.join('\n');
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      return extractFromPdf(file, attempt + 1);
    }
    throw new Error(
      `PDF extraction failed after ${MAX_RETRIES + 1} attempts: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

async function extractFromDocx(file: File, attempt: number = 0): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      return extractFromDocx(file, attempt + 1);
    }
    throw new Error(
      `DOCX extraction failed after ${MAX_RETRIES + 1} attempts: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

async function extractFromTxt(file: File, attempt: number = 0): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        resolve(text);
      } else {
        if (attempt < MAX_RETRIES) {
          extractFromTxt(file, attempt + 1).then(resolve).catch(reject);
        } else {
          reject(new Error(`TXT extraction failed after ${MAX_RETRIES + 1} attempts: unexpected result type`));
        }
      }
    };

    reader.onerror = () => {
      if (attempt < MAX_RETRIES) {
        extractFromTxt(file, attempt + 1).then(resolve).catch(reject);
      } else {
        reject(
          new Error(
            `TXT extraction failed after ${MAX_RETRIES + 1} attempts: ${reader.error?.message ?? 'FileReader error'}`
          )
        );
      }
    };

    reader.readAsText(file, 'UTF-8');
  });
}

export async function extract(file: File): Promise<string> {
  let rawText: string;

  const fileType = file.type;

  if (fileType === 'application/pdf') {
    rawText = await extractFromPdf(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    rawText = await extractFromDocx(file);
  } else if (fileType === 'text/plain') {
    rawText = await extractFromTxt(file);
  } else {
    throw new Error(
      `Unsupported file type: ${fileType}. Supported types are PDF, DOCX, and TXT.`
    );
  }

  return clean(rawText);
}
```