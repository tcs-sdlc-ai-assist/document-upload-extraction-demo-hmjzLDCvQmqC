import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validate } from './fileValidator';
import { MAX_FILE_SIZE_BYTES, SUPPORTED_FILE_TYPES } from '../constants';

function createMockFile(name: string, size: number, type: string): File {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: size, writable: false });
  return file;
}

describe('fileValidator', () => {
  describe('validate', () => {
    describe('valid files', () => {
      it('accepts a valid PDF file under the size limit', () => {
        const file = createMockFile('document.pdf', 1024 * 1024, 'application/pdf');
        const result = validate(file);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('accepts a valid DOCX file under the size limit', () => {
        const file = createMockFile(
          'document.docx',
          1024 * 1024,
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );
        const result = validate(file);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('accepts a valid TXT file under the size limit', () => {
        const file = createMockFile('document.txt', 1024, 'text/plain');
        const result = validate(file);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('accepts an empty file (0 bytes) with a valid type', () => {
        const file = createMockFile('empty.txt', 0, 'text/plain');
        const result = validate(file);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('accepts a file at exactly the maximum allowed size', () => {
        const file = createMockFile('boundary.pdf', MAX_FILE_SIZE_BYTES, 'application/pdf');
        const result = validate(file);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('accepts a file at one byte below the maximum allowed size', () => {
        const file = createMockFile('almost-max.pdf', MAX_FILE_SIZE_BYTES - 1, 'application/pdf');
        const result = validate(file);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    describe('file size validation', () => {
      it('rejects a file that exceeds the maximum allowed size', () => {
        const file = createMockFile('large.pdf', MAX_FILE_SIZE_BYTES + 1, 'application/pdf');
        const result = validate(file);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error).toContain('MB');
      });

      it('rejects a file that is significantly over the size limit', () => {
        const file = createMockFile('huge.pdf', MAX_FILE_SIZE_BYTES * 2, 'application/pdf');
        const result = validate(file);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('includes the max file size in the error message', () => {
        const file = createMockFile('large.pdf', MAX_FILE_SIZE_BYTES + 1, 'application/pdf');
        const result = validate(file);
        const maxMb = MAX_FILE_SIZE_BYTES / (1024 * 1024);
        expect(result.error).toContain(String(maxMb));
      });
    });

    describe('file type validation', () => {
      it('rejects an executable file (.exe)', () => {
        const file = createMockFile('program.exe', 1024, 'application/x-msdownload');
        const result = validate(file);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('rejects a PNG image file', () => {
        const file = createMockFile('image.png', 1024, 'image/png');
        const result = validate(file);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('rejects a JPEG image file', () => {
        const file = createMockFile('photo.jpg', 1024, 'image/jpeg');
        const result = validate(file);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('rejects a ZIP archive file', () => {
        const file = createMockFile('archive.zip', 1024, 'application/zip');
        const result = validate(file);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('rejects a file with an empty MIME type', () => {
        const file = createMockFile('unknown', 1024, '');
        const result = validate(file);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('rejects an HTML file', () => {
        const file = createMockFile('page.html', 1024, 'text/html');
        const result = validate(file);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('includes supported file types in the error message for unsupported type', () => {
        const file = createMockFile('image.png', 1024, 'image/png');
        const result = validate(file);
        expect(result.error).toContain('PDF');
        expect(result.error).toContain('DOCX');
        expect(result.error).toContain('TXT');
      });

      it('rejects a file with a MIME type that is a prefix of a valid type', () => {
        const file = createMockFile('fake.pdf', 1024, 'application');
        const result = validate(file);
        expect(result.isValid).toBe(false);
      });
    });

    describe('size check takes priority over type check', () => {
      it('rejects an oversized file even if the type is valid', () => {
        const file = createMockFile('large.pdf', MAX_FILE_SIZE_BYTES + 1, 'application/pdf');
        const result = validate(file);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('MB');
      });
    });

    describe('supported file types constant', () => {
      it('includes application/pdf in supported types', () => {
        expect(SUPPORTED_FILE_TYPES).toContain('application/pdf');
      });

      it('includes DOCX MIME type in supported types', () => {
        expect(SUPPORTED_FILE_TYPES).toContain(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );
      });

      it('includes text/plain in supported types', () => {
        expect(SUPPORTED_FILE_TYPES).toContain('text/plain');
      });
    });
  });
});