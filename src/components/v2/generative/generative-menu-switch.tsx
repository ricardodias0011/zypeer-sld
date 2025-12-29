import { EditorBubble, removeAIHighlight, useEditor } from "novel";
import { Fragment, type ReactNode, useEffect } from "react";
import { Button } from "../ui/button";
import Magic from "../ui/icons/magic";
import { AISelector } from "./ai-selector";

interface GenerativeMenuSwitchProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: (e: string) => void;
}
const GenerativeMenuSwitch = ({ children, open, onOpenChange, onChanged }: GenerativeMenuSwitchProps) => {
  const { editor } = useEditor();

  useEffect(() => {
    // @ts-ignore
    if (!open) removeAIHighlight(editor);
  }, [open]);
  return (
    <EditorBubble
      tippyOptions={{
        placement: open ? "bottom-start" : "top",
        onHidden: () => {
          onOpenChange(false);
          // @ts-ignore
          editor.chain().unsetHighlight().run();
        },
      }}
      className="flex w-fit max-w-[90vw] max-h-[300px] items-center gap-2  overflow-auto rounded-md border border-gray-300 bg-white text-zinc-800 shadow-xl EditorBubble"
    >
      {open && <AISelector open={open} onOpenChange={onOpenChange} onChanged={onChanged} />}
      {!open && (
        <Fragment>
          <Button
            className="gap-1 rounded-none text-blue-500! flex flex-row hover:bg-blue-50!"
            variant="ghost"
            onClick={() => onOpenChange(true)}
            size="sm"
          >
            <Magic className="h-5 w-5" />
            Com IA
          </Button>
          {children}
        </Fragment>
      )}
    </EditorBubble>
  );
};

export default GenerativeMenuSwitch;
