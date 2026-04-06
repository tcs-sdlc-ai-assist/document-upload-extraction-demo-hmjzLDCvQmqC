import { describe, it, expect } from 'vitest';
import { clean } from './textCleaner';

describe('textCleaner', () => {
  describe('clean', () => {
    it('returns empty string for empty input', () => {
      expect(clean('')).toBe('');
    });

    it('returns empty string for null-like input', () => {
      expect(clean(null as unknown as string)).toBe('');
    });

    it('returns empty string for non-string input', () => {
      expect(clean(undefined as unknown as string)).toBe('');
      expect(clean(42 as unknown as string)).toBe('');
    });

    it('returns clean text unchanged', () => {
      const text = 'This is a clean sentence.';
      expect(clean(text)).toBe(text);
    });

    it('trims leading and trailing whitespace', () => {
      expect(clean('  hello world  ')).toBe('hello world');
    });

    it('removes null bytes', () => {
      const text = 'hello\0world';
      expect(clean(text)).toBe('hello world');
    });

    it('removes multiple null bytes', () => {
      const text = '\0\0hello\0\0world\0\0';
      expect(clean(text)).toBe('hello world');
    });

    it('removes control characters except newlines and tabs', () => {
      // \x01 through \x08 are control characters that should be removed
      const text = 'hello\x01\x02\x03world';
      expect(clean(text)).toBe('helloworld');
    });

    it('removes vertical tab and form feed as control characters or replaces them', () => {
      // \x0B is vertical tab (control char), \x0C is form feed (replaced with newline)
      const text = 'hello\x0Bworld';
      expect(clean(text)).toBe('helloworld');
    });

    it('replaces form feed with newline', () => {
      const text = 'page one\fpage two';
      const result = clean(text);
      expect(result).toContain('page one');
      expect(result).toContain('page two');
    });

    it('removes soft hyphens', () => {
      const text = 'hyphen\u00ADated';
      expect(clean(text)).toBe('hyphennated');
    });

    it('removes zero-width spaces', () => {
      const text = 'hello\u200Bworld';
      expect(clean(text)).toBe('helloworld');
    });

    it('removes zero-width non-joiners', () => {
      const text = 'hello\u200Cworld';
      expect(clean(text)).toBe('helloworld');
    });

    it('removes zero-width joiners', () => {
      const text = 'hello\u200Dworld';
      expect(clean(text)).toBe('helloworld');
    });

    it('removes byte order marks', () => {
      const text = '\uFEFFhello world';
      expect(clean(text)).toBe('hello world');
    });

    it('replaces non-breaking spaces with regular spaces', () => {
      const text = 'hello\u00A0world';
      expect(clean(text)).toBe('hello world');
    });

    it('collapses multiple spaces into a single space', () => {
      const text = 'hello   world';
      expect(clean(text)).toBe('hello world');
    });

    it('normalizes Windows-style line endings to Unix', () => {
      const text = 'line one\r\nline two\r\nline three';
      const result = clean(text);
      expect(result).toBe('line one\nline two\nline three');
    });

    it('normalizes carriage returns to newlines', () => {
      const text = 'line one\rline two';
      const result = clean(text);
      expect(result).toBe('line one\nline two');
    });

    it('replaces tabs with spaces', () => {
      const text = 'hello\tworld';
      expect(clean(text)).toBe('hello world');
    });

    it('collapses more than 2 consecutive newlines into 2', () => {
      const text = 'paragraph one\n\n\n\n\nparagraph two';
      const result = clean(text);
      expect(result).toBe('paragraph one\n\nparagraph two');
    });

    it('preserves up to 2 consecutive newlines', () => {
      const text = 'paragraph one\n\nparagraph two';
      const result = clean(text);
      expect(result).toBe('paragraph one\n\nparagraph two');
    });

    it('trims whitespace from each line', () => {
      const text = '  line one  \n  line two  ';
      const result = clean(text);
      expect(result).toBe('line one\nline two');
    });

    it('removes repeated dashes used as separators', () => {
      const text = 'section one\n---\nsection two';
      const result = clean(text);
      expect(result).not.toContain('---');
    });

    it('removes repeated underscores used as separators', () => {
      const text = 'section one\n___\nsection two';
      const result = clean(text);
      expect(result).not.toContain('___');
    });

    it('removes standalone page numbers', () => {
      const text = 'some content\n42\nmore content';
      const result = clean(text);
      expect(result).not.toMatch(/^\s*42\s*$/m);
    });

    it('removes private use area Unicode characters', () => {
      const text = 'hello\uE000world';
      expect(clean(text)).toBe('helloworld');
    });

    it('handles multiline document text correctly', () => {
      const text = 'Title\n\nThis is the first paragraph.\n\nThis is the second paragraph.';
      const result = clean(text);
      expect(result).toBe('Title\n\nThis is the first paragraph.\n\nThis is the second paragraph.');
    });

    it('handles text with mixed artifacts', () => {
      const text = '  \0Hello\u200B World\u00A0!\r\n  ';
      const result = clean(text);
      expect(result).toBe('Hello World !');
    });

    it('handles text with only whitespace', () => {
      const text = '   \t\n   ';
      const result = clean(text);
      expect(result).toBe('');
    });

    it('preserves normal punctuation', () => {
      const text = 'Hello, world! How are you? Fine, thanks.';
      expect(clean(text)).toBe('Hello, world! How are you? Fine, thanks.');
    });

    it('preserves numbers within text', () => {
      const text = 'There are 42 items in the list.';
      expect(clean(text)).toBe('There are 42 items in the list.');
    });

    it('handles a realistic PDF-like text with artifacts', () => {
      const text = '\uFEFF  Document Title  \r\n\r\nThis is paragraph one.\r\n\r\n\r\n\r\nThis is paragraph two.\r\n\r\n1\r\n\r\nEnd of document.  ';
      const result = clean(text);
      expect(result).toContain('Document Title');
      expect(result).toContain('This is paragraph one.');
      expect(result).toContain('This is paragraph two.');
      expect(result).toContain('End of document.');
      // Should not have more than 2 consecutive newlines
      expect(result).not.toMatch(/\n{3,}/);
    });
  });
});