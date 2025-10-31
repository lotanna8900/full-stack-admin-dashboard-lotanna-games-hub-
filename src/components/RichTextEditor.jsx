"use client";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useCallback } from 'react';

// --- The Toolbar Component ---
const Toolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  // A simple handler for adding links
  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="editor-toolbar">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}>
        Bold
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}>
        Italic
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''}>
        Strike
      </button>
      <button type="button" onClick={setLink} className={editor.isActive('link') ? 'is-active' : ''}>
        Set Link
      </button>
      <button type="button" onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')}>
        Unlink
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}>
        H2
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''}>
        List
      </button>
    </div>
  );
};

// --- The Main Editor Component ---
export default function RichTextEditor({ initialContent = '', onUpdate }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false, // Don't open links when clicking in the editor
      }),
    ],
    // --- FIX FROM THE ERROR MESSAGE ---
    immediatelyRender: false, 
    // --- END OF FIX ---
    content: initialContent,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML()); 
    },
    editorProps: {
      attributes: {
        class: 'form-textarea tiptap-editor',
      },
    },
  });

  return (
    <div className="rich-text-editor-container">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}