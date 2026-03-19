
'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { 
    Bold, Italic, Underline as UnderlineIcon, Paintbrush, Eraser, 
    HighlighterIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const fonts = [
    { name: 'Default', value: 'default' },
    { name: 'Karla', value: 'Karla' },
    { name: 'Playfair Display', value: 'Playfair Display' },
    { name: 'Montserrat', value: 'Montserrat' },
]

const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) {
        return null;
    }
    
    return (
        <div className="border border-input rounded-t-md p-2 flex flex-wrap items-center gap-1 bg-muted/50">
            <Select
                value={fonts.find(f => editor.isActive('textStyle', { fontFamily: f.value }))?.value || 'default'}
                onValueChange={(value) => {
                    if (value && value !== 'default') {
                        editor.chain().focus().setFontFamily(value).run()
                    } else {
                        editor.chain().focus().unsetFontFamily().run()
                    }
                }}
            >
                <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Font" />
                </SelectTrigger>
                <SelectContent>
                    {fonts.map(font => (
                        <SelectItem key={font.name} value={font.value} style={{ fontFamily: font.value }}>
                            {font.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
                size="sm"
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
                size="sm"
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
                size="sm"
            >
                <UnderlineIcon className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <div className="flex items-center gap-1">
                <Paintbrush className="h-4 w-4" />
                <input
                    type="color"
                    onInput={(event) => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
                    value={editor.getAttributes('textStyle').color || '#000000'}
                    className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer"
                    title="Color de Texto"
                />
            </div>
            
            <div className="flex items-center gap-1">
                 <HighlighterIcon className="h-4 w-4" />
                <input
                    type="color"
                    onInput={(event) => editor.chain().focus().toggleHighlight({ color: (event.target as HTMLInputElement).value }).run()}
                    value={editor.getAttributes('highlight').color || '#ffffff'}
                    className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer"
                    title="Color de Resaltado"
                />
            </div>


            <Separator orientation="vertical" className="h-6 mx-1" />

            <Button
                type="button"
                onClick={() => editor.chain().focus().unsetColor().unsetHighlight().run()}
                variant='ghost'
                size="sm"
                title="Limpiar formato"
            >
                <Eraser className="h-4 w-4" />
            </Button>
        </div>
    );
};


const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        listItem: false,
        bulletList: false,
        orderedList: false,
      }),
      Underline,
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none prose-p:my-2 prose-p:leading-normal',
      },
    },
  });

  return (
    <div className="rounded-md border border-input focus-within:ring-2 focus-within:ring-ring">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
