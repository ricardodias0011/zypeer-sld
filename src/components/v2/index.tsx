import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  ImageResizer,
  handleCommandNavigation,
  handleImageDrop,
  handleImagePaste
} from "novel";
import { memo, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { ColorSelector } from "./selectors/color-selector";
import { MathSelector } from "./selectors/math-selector";
import { NodeSelector } from "./selectors/node-selector";
import { Separator } from "./ui/separator";

import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { uploadFn } from "./image-upload";
import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "./slash-command";




import { cn, textColorFromHex } from "@/lib/utils";
import type { Slide } from "@/stores/slideStore";
import hljs from "highlight.js";

const extensions = [...defaultExtensions, slashCommand];

interface SlideProps extends Slide {
  readOnly?: boolean
}

interface tailwindAdvancedEditorProps {
  slide: SlideProps
  onUpdate: (d: string, field: keyof Slide, value: string) => void;
}

const TailwindAdvancedEditor = (props: tailwindAdvancedEditorProps) => {
  const { slide, onUpdate } = props;
  const [editor, setEditor] = useState<EditorInstance | null>(null);


  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openAI, setOpenAI] = useState(false);

  const [content, setContent] = useState('');
  const [canUpdate, setCanUpdate] = useState(false);

  const timeoutRef = useRef<any>(null);

  const [colorText, setColorText] = useState('#fff');



  const highlightCodeblocks = (content: string) => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    doc.querySelectorAll("pre code").forEach((el) => {
      // @ts-ignore
      // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
      hljs.highlightElement(el);
    });
    return new XMLSerializer().serializeToString(doc);
  };


  const debouncedUpdates = useDebouncedCallback(async (editor: EditorInstance) => {
    const json = editor.getJSON();
    window.localStorage.setItem("html-content", highlightCodeblocks(editor.getHTML()));
    window.localStorage.setItem("novel-content", JSON.stringify(json));
    setCanUpdate(true);
    try {
      const _content = editor.storage.markdown.getMarkdown();
      setContent(_content)
    } catch (err) {
    }

    window.localStorage.setItem("markdown", editor.storage.markdown.getMarkdown());
  }, 500);



  useEffect(() => {
    const ct = textColorFromHex(slide?.bgcolor ?? '#fff') === 'dark' ? 'text-zinc-800' : 'text-zinc-100';
    setColorText(ct);
  }, [slide.bgcolor])

  useEffect(() => {
    if (content && canUpdate) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        onUpdate(slide.id, 'content', content);
      }, 1500);
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [content, canUpdate]);

  useEffect(() => {
    if (slide.content !== content) {
      setContent(slide.content)
    }
  }, [slide])


  return (
    <EditorRoot>
      <EditorContent
        onCreate={e => {
          e.editor.commands.setContent(content ?? `Questão`);
          setEditor(e.editor);
        }}
        extensions={extensions as any}
        className={cn(colorText, "relative w-full max-w-screen-lg bg-background  sm:rounded-lg")}
        editorProps={{
          handleDOMEvents: {
            keydown: (_view, event) => handleCommandNavigation(event),
          },
          handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
          handleDrop: (view, event, _slice, moved) => handleImageDrop(view, event, moved, uploadFn),
          attributes: {
            class:
              "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
          }
        }}
        onUpdate={({ editor }) => {
          if (slide?.readOnly) {
            return
          }
          debouncedUpdates(editor);
        }}
        slotAfter={<ImageResizer />}
      >
        <EditorCommand className="pointer-events-auto z-50 h-auto editor-command max-h-[330px] overflow-y-auto rounded-md  bg-background px-1 py-2 shadow-md transition-all">
          <EditorCommandEmpty className="px-2 text-muted-foreground">Sem resultados</EditorCommandEmpty>
          <EditorCommandList>
            {suggestionItems.map((item) => (
              <EditorCommandItem
                value={item.title}
                // @ts-ignore
                onCommand={(val) => item?.command(val)}
                className="editor-command-item flex w-full text-black items-center space-x-2 bg-background rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                key={item.title}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md dark:border-zinc-700 border-zinc-200 bg-background">
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
        <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
          <Separator orientation="vertical" />
          <NodeSelector open={openNode} onOpenChange={setOpenNode} />
          {/* <Separator orientation="vertical" /> */}
          {/* <LinkSelector open={openLink} onOpenChange={setOpenLink} /> */}
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


export default memo(TailwindAdvancedEditor);
