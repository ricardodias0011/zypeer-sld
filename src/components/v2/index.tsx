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
import { useCallback, useEffect, useRef, useState } from "react";
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



import { AssetsService } from "@/services/assets";
import { toast } from "sonner";

import { cn, textColorFromHex } from "@/lib/utils";
import type { Slide } from "@/pages/v2/slide";
import hljs from "highlight.js";

const extensions = [...defaultExtensions, slashCommand];

interface tailwindAdvancedEditorProps {
  slide: Slide
}

const TailwindAdvancedEditor = (props: tailwindAdvancedEditorProps) => {
  const { slide } = props;
  const [editor, setEditor] = useState<EditorInstance | null>(null);

  const [saveStatus, setSaveStatus] = useState("Salvo");
  const [charsCount, setCharsCount] = useState();

  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);

  const [content, setContent] = useState('');
  const [canUpdate, setCanUpdate] = useState(false);

  const timeoutRef = useRef<any>(null);
  const timeoutQuestionRef = useRef<any>(null);

  const [showUpload, setShowUpload] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);

  const [title, setTitle] = useState("");
  const [explanationAnswer, setExplanationAnswer] = useState("");

  const [colorText, setColorText] = useState('#fff');

  const onDrop = useCallback((acceptedFiles: any[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        const binaryStr = reader.result as ArrayBuffer
        const blob = new Blob([binaryStr], { type: file.type });
        const newFile = new File([blob], file.name, { type: file.type });
        UploadAssets(newFile);
      }
      reader.readAsArrayBuffer(file)
    })
  }, [])



  const UploadAssets = (file: File) => {
    setLoadingUpload(true);
    setSaveStatus("Salvando...");
    AssetsService.upload(file, "assets")
      .then(({ data }) => {
        if (data?.link) {
          addImage(data.link);
          setShowUpload(false);
        }
        setSaveStatus("Salvo");
      })
      .catch(() => {
        setSaveStatus("Não salvo...");
        toast("Erro ao realizar upload", { position: "top-right" });
      })
      .finally(() => setLoadingUpload(false));
  }

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
    setCharsCount(editor.storage.characterCount.words());
    window.localStorage.setItem("html-content", highlightCodeblocks(editor.getHTML()));
    window.localStorage.setItem("novel-content", JSON.stringify(json));
    setCanUpdate(true);
    try {
      const _content = editor.storage.markdown.getMarkdown();
      console.log(_content)
      setContent(_content)
    } catch (err) {
      setSaveStatus("Erro");
    }

    window.localStorage.setItem("markdown", editor.storage.markdown.getMarkdown());
  }, 500);

  const addText = () => {
    if (!editor) return;
    editor.chain().focus().insertContent({
      type: "paragraph",
      content: [{ type: "text", text: "Novo texto..." }],
    }).run();
  };

  const addImage = (url: string) => {
    console.log(editor)
    if (!editor) return;
    if (!url) return;
    editor.chain().focus().insertContent({
      type: "image",
      attrs: { src: url, alt: "Imagem" },
    }).run();
  };



  const handleAddContent = (_data: any) => {

  }


  const updateContent = async (content: any, idcontent: string, type: 'text' | 'resize') => {
    setSaveStatus("Salvando...");
    const resize = content as { width: string, heigth: string }

  }

  useEffect(() => {
    const ct = textColorFromHex(slide.bgcolor) === 'dark' ? 'text-zinc-800' : 'text-zinc-100';
    setColorText(ct);
    console.log(ct)
  }, [slide.bgcolor])

  useEffect(() => {
    if (content && canUpdate) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        // if (question?.content?.[0]?.id) {
        //   updateContent({ text: content, type: 'text', questionId: question.id }, question?.content?.[0]?.id, 'text')
        // } else {
        //   handleAddContent({
        //     text: content,
        //     type: "text"
        //   });
        // }
      }, 2000);
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

  useEffect(() => {
    if (timeoutQuestionRef.current) {
      clearTimeout(timeoutQuestionRef.current);
    }
    timeoutQuestionRef.current = setTimeout(() => {

    }, 1500);
    return () => {
      if (timeoutQuestionRef.current) {
        clearTimeout(timeoutQuestionRef.current);
      }
    };
  }, [title, explanationAnswer])


  return (
    <EditorRoot>
      <EditorContent
        onCreate={e => {
          e.editor.commands.setContent(content ?? `Questão`);
          setEditor(e.editor)
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
          debouncedUpdates(editor);
          setSaveStatus("Não salvo");
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


export default TailwindAdvancedEditor;
