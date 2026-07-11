'use client';

import { RefObject, useCallback } from 'react';

interface UseEditorActionsProps {
  content: string;
  setContent: (value: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

function wrapSelection(
  textarea: HTMLTextAreaElement,
  content: string,
  setContent: (value: string) => void,
  before: string,
  after: string
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = content.substring(start, end);
  const replacement = before + selected + after;

  const newContent = content.substring(0, start) + replacement + content.substring(end);
  setContent(newContent);

  requestAnimationFrame(() => {
    textarea.focus();
    textarea.selectionStart = start + before.length;
    textarea.selectionEnd = start + before.length + selected.length;
  });
}

export function useEditorActions({ content, setContent, textareaRef }: UseEditorActionsProps) {
  const bold = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    wrapSelection(textarea, content, setContent, '<strong>', '</strong>');
  }, [content, setContent, textareaRef]);

  const italic = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    wrapSelection(textarea, content, setContent, '<em>', '</em>');
  }, [content, setContent, textareaRef]);

  const code = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    wrapSelection(textarea, content, setContent, '<code>', '</code>');
  }, [content, setContent, textareaRef]);

  const quote = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    wrapSelection(textarea, content, setContent, '<blockquote>', '</blockquote>');
  }, [content, setContent, textareaRef]);

  const link = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const url = window.prompt('Enter URL:');
    if (!url) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end) || url;
    const replacement = `<a href="${url}">${selected}</a>`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    requestAnimationFrame(() => {
      textarea.focus();
      const newCursorPos = start + `<a href="${url}">`.length + selected.length;
      textarea.selectionStart = start;
      textarea.selectionEnd = newCursorPos;
    });
  }, [content, setContent, textareaRef]);

  const list = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);

    const lines = selected.split('\n').filter(Boolean);
    const items = lines.length > 0
      ? lines.map(line => `<li>${line}</li>`).join('\n')
      : '<li>List item</li>';
    const replacement = `<ul>\n${items}\n</ul>`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = start;
      textarea.selectionEnd = start + replacement.length;
    });
  }, [content, setContent, textareaRef]);

  return { bold, italic, code, quote, link, list };
}
