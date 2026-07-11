# Issue: Post Editor Toolbar Buttons Are Non-Functional

## Description
The formatting toolbar in the post editor (`/posts/new` and `/posts/[id]/edit`) has buttons for Bold, Italic, List, Link, Code, and Quote, but none of them do anything. They are purely decorative — no `onClick` handlers, no content modification logic.

## Current State
- **Editor:** Plain `<textarea>` bound to `content` state
- **Toolbar:** 6 static buttons rendered from an array, each with `<tool.icon>` but no action
- **Only working button:** Image upload (recently implemented)

## Expected Behavior
- Clicking Bold wraps selected text in `<strong>` tags
- Clicking Italic wraps selected text in `<em>` tags
- Clicking List wraps selected text in `<ul><li>` tags
- Clicking Link prompts for URL, wraps selection in `<a href="url">` tags
- Clicking Code wraps selected text in `<code>` tags
- Clicking Quote wraps selected text in `<blockquote>` tags

## Affected Files
- `frontend/app/posts/new/page.tsx`
- `frontend/app/posts/[id]/edit/page.tsx`

## Resolution
Create a shared `useEditorActions` hook that handles textarea selection and HTML tag insertion, then wire it into both editor pages.
