import { cn } from "@/lib/utils";
import { EditorContent, EditorRoot, type JSONContent } from "novel";
import { useMemo } from "react";
import { defaultExtensions } from "../extensions";
import { slashCommand } from "../slash-command";

const extensions = [...defaultExtensions, slashCommand];

interface ReadOnlyEditorProps {
  content?: string;
  className?: string;
}

const ReadOnlyEditor = ({ content, className }: ReadOnlyEditorProps) => {
  const memoizedExtensions = useMemo(() => extensions, []);

  return (
    <EditorRoot>
      <EditorContent
        editable={false}
        initialContent={content as unknown as JSONContent}
        extensions={memoizedExtensions}
        className={cn(
          "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
          className
        )}
        editorProps={{
          attributes: {
            class: "focus:outline-none",
          },
        }}
      />
    </EditorRoot>
  );
};

export default ReadOnlyEditor;