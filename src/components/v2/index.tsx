import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  EditorRoot,
  handleCommandNavigation,
  handleImageDrop,
  handleImagePaste,
  ImageResizer,
  type EditorInstance,
  type JSONContent
} from "novel";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import { defaultExtensions } from "./extensions";
import { ColorSelector } from "./selectors/color-selector";
import { MathSelector } from "./selectors/math-selector";
import { NodeSelector } from "./selectors/node-selector";
import { TextButtons } from "./selectors/text-buttons";
import { Separator } from "./ui/separator";

import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { uploadFn } from "./image-upload";
import { slashCommand, suggestionItems } from "./slash-command";

import { cn, textColorFromHex } from "@/lib/utils";
import type { Slide, SlideContentType } from "@/stores/slideStore";
import hljs from "highlight.js";

const extensions = [...defaultExtensions, slashCommand];

interface SlideProps extends Slide {
  readOnly?: boolean;
}

interface TailwindAdvancedEditorProps {
  slide: SlideProps;
  contentSlide?: SlideContentType;
  onUpdate: (id: string, field: keyof Slide, value: SlideContentType[]) => void;
  onDelete: (id: string) => void;
}

const TailwindAdvancedEditor = ({ slide, onUpdate, contentSlide, onDelete }: TailwindAdvancedEditorProps) => {
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openAI, setOpenAI] = useState(false);

  const contentRef = useRef("");
  const [canUpdate, setCanUpdate] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncedRef = useRef<string>('');
  const isInternalUpdateRef = useRef<boolean>(false);
  const editorKeyRef = useRef<string>(contentSlide?.id || 'default');

  const [colorText, setColorText] = useState("#fff");
  const editorRef = useRef<EditorInstance | null>(null);

  const highlightCodeblocks = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll("pre code").forEach((el) => {
      hljs.highlightElement(el as HTMLElement);
    });
    return new XMLSerializer().serializeToString(doc);
  };

  const debouncedUpdates = useDebouncedCallback(async (editor: EditorInstance) => {
    const markdown = editor.storage.markdown.getMarkdown();
    const html = editor.getHTML();

    window.localStorage.setItem("markdown", markdown);
    window.localStorage.setItem("novel-content", JSON.stringify(editor.getJSON()));
    window.localStorage.setItem("html-content", highlightCodeblocks(html));

    isInternalUpdateRef.current = true;
    lastSyncedRef.current = markdown;
    contentRef.current = markdown;
    setCanUpdate(true);
  }, 500);

  useEffect(() => {

    const type = textColorFromHex(slide.bgcolor ?? "#fff");
    setColorText(type === "dark" ? "text-zinc-800" : "text-zinc-100");
  }, [slide.bgcolor]);

  useEffect(() => {
    if (!canUpdate) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (contentRef.current !== contentSlide?.text && contentSlide?.id && !openAI) {
        isInternalUpdateRef.current = true;
        const _s = slide.content.filter(a => a.id !== contentSlide?.id);
        // if (content?.trim().length === 0) {
        //   onDelete(contentSlide?.id || '');
        //   return;
        // }
        onUpdate(slide.id, "content", [
          ..._s,
          {
            ...(contentSlide as SlideContentType || {}),
            text: contentRef.current
          }
        ]);
      }
    }, 1500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentRef.current, canUpdate, slide.content, contentSlide?.text, openAI]);

  useEffect(() => {
    if (contentSlide?.id && contentSlide.id !== editorKeyRef.current) {
      editorKeyRef.current = contentSlide.id;
    }
  }, [contentSlide?.id]);


  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    if (isInternalUpdateRef.current) {
      if (contentSlide?.text === lastSyncedRef.current) {
        isInternalUpdateRef.current = false;
      }
      return;
    }

    if (contentSlide?.text !== lastSyncedRef.current && contentSlide?.text !== undefined) {
      const currentContent = editor.storage.markdown.getMarkdown();
      if (currentContent !== contentSlide?.text) {
        requestAnimationFrame(() => {
          if (editor && !editor.isDestroyed) {
            editor.commands.setContent(contentSlide.text || 'Texto');
            lastSyncedRef.current = contentSlide.text || 'Texto';
            contentRef.current = contentSlide.text || 'Texto';
          }
        });
      }
    }
  }, [contentSlide?.text, editorRef]);

  const editorProps = useMemo(() => ({
    handleDOMEvents: {
      keydown: (_view: any, event: KeyboardEvent) => {
        handleCommandNavigation(event);
        if (event.key === 'Backspace' && editorRef.current && !slide.readOnly && contentSlide?.id) {
          const currentContent = editorRef.current.storage.markdown.getMarkdown();
          const isEmpty = !currentContent || currentContent.trim().length === 0;

          if (isEmpty) {
            onDelete(contentSlide.id);
          }
        }
      },
    },
    handlePaste: (view: any, event: ClipboardEvent) => handleImagePaste(view, event, uploadFn),
    handleDrop: (view: any, event: DragEvent, _slice: any, moved: boolean) => handleImageDrop(view, event, moved, uploadFn),
    attributes: {
      class:
        "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
    },
  }), [editorRef, slide.readOnly, contentSlide?.id]);

  const memoizedExtensions = useMemo(() => extensions, []);

  const editorClassName = useMemo(() =>
    cn(colorText, "relative w-full max-w-screen-lg bg-background sm:rounded-lg"),
    [colorText]
  );


  return (
    <EditorRoot>
      <EditorContent
        key={editorKeyRef.current}
        editable={!slide.readOnly}
        initialContent={contentSlide?.text as unknown as JSONContent || undefined}
        onCreate={({ editor }) => {
          editorRef.current = editor;
          const currentMarkdown = editor.storage.markdown.getMarkdown();
          const initialContent = (contentSlide?.text && contentSlide.text.length > 0)
            ? contentSlide.text
            : (currentMarkdown && currentMarkdown.length > 0 ? currentMarkdown : undefined);

          if (initialContent && initialContent !== currentMarkdown) {
            editor.commands.setContent(initialContent);
            lastSyncedRef.current = initialContent;
            contentRef.current = initialContent;
          } else {
            lastSyncedRef.current = currentMarkdown || '';
            contentRef.current = currentMarkdown || '';
          }
        }}
        extensions={memoizedExtensions}
        className={editorClassName}
        editorProps={editorProps}
        onDestroy={(e) => { editorRef.current = null; }}
        onUpdate={({ editor }) => {
          if (!slide.readOnly) debouncedUpdates(editor);
        }}
        slotAfter={<ImageResizer />}
      >
        <EditorCommand className="pointer-events-auto z-50 max-h-[330px] overflow-y-auto rounded-md bg-background px-1 py-2 shadow-md">
          <EditorCommandEmpty className="px-2 text-muted-foreground">
            Sem resultados
          </EditorCommandEmpty>
          <EditorCommandList>
            {suggestionItems.map((item) => (
              <EditorCommandItem
                key={item.title}
                value={item.title}
                // @ts-ignore 
                onCommand={(val) => item?.command(val)}
                className="editor-command-item flex w-full items-center space-x-2 rounded-md bg-background px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-background">
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </EditorCommandItem>
            ))}
          </EditorCommandList>
        </EditorCommand>
        <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI} onChanged={(value) => contentRef.current = value}>
          <Separator orientation="vertical" />
          <NodeSelector open={openNode} onOpenChange={setOpenNode} />
          <Separator orientation="vertical" />
          <MathSelector />
          <Separator orientation="vertical" />
          <TextButtons />
          <Separator orientation="vertical" />
          <ColorSelector open={openColor} onOpenChange={setOpenColor} />
        </GenerativeMenuSwitch>
      </EditorContent>
    </EditorRoot>
  );
};

export default memo(TailwindAdvancedEditor, (prevProps, nextProps) => {
  const propsEqual = (
    prevProps.slide.id === nextProps.slide.id &&
    prevProps.contentSlide?.id === nextProps.contentSlide?.id &&
    prevProps.contentSlide?.text === nextProps.contentSlide?.text &&
    prevProps.slide.readOnly === nextProps.slide.readOnly &&
    prevProps.slide.bgcolor === nextProps.slide.bgcolor &&
    prevProps.slide.layout === nextProps.slide.layout &&
    prevProps.slide.type === nextProps.slide.type &&
    prevProps.onUpdate === nextProps.onUpdate &&
    prevProps.onDelete === nextProps.onDelete
  );
  return propsEqual;
});
