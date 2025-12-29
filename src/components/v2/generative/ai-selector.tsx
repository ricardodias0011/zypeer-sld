"use client";

import { Command, CommandInput } from "@/components/v2/ui/command";

// import { useCompletion } from "ai/react";
import { ToolsService } from "@/services/tools";
import { ArrowUp } from "lucide-react";
import { addAIHighlight, useEditor } from "novel";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import CrazySpinner from "../ui/icons/crazy-spinner";
import Magic from "../ui/icons/magic";
import { ScrollArea } from "../ui/scroll-area";
import ReadOnlyEditor from "../ui/textPreview";
import AICompletionCommands from "./ai-completion-command";
import AISelectorCommands from "./ai-selector-commands";

interface AISelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: (e: string) => void;
}

export function AISelector({ onOpenChange, onChanged }: AISelectorProps) {
  const { editor } = useEditor();
  const [inputValue, setInputValue] = useState("");
  const [completion, setCompletion] = useState("");
  const [isLoading, setIsLoading] = useState(false);



  const complete = async (textOrPrompt: string, options: any) => {
    setIsLoading(true);
    try {
      let originalText = "";
      let description = "";

      if (options?.body?.command || options?.body?.option) {
        originalText = textOrPrompt;
        description = options?.body?.command || options?.body?.option;
      } else {
        description = textOrPrompt;
        // @ts-ignore
        const slice = editor.state.selection.content();
        // @ts-ignore
        originalText = editor.storage.markdown.serializer.serialize(slice.content);
      }

      const res = await ToolsService.rewriter({ originalText, description });

      if (res?.data?.text) {
        setCompletion(res.data.text);
        onChanged(res.data.text);
      }
    } catch (err: any) {
      toast.error("Error in rewriter", {
        description: err?.response?.data?.message ?? "Desculpe, ocorreu um erro.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasCompletion = completion.length > 0;

  return (
    <Command className="w-[350px]">
      {hasCompletion && (
        <div className="flex max-h-[400px]">
          <ScrollArea>
            <div className="prose p-2 px-4 prose-sm">
              <ReadOnlyEditor content={completion} />
            </div>
          </ScrollArea>
        </div>
      )}

      {isLoading && (
        <div className="flex h-12 w-full items-center px-4 text-sm font-medium text-muted-foreground text-blue-500">
          <Magic className="mr-2 h-4 w-4 shrink-0  " />
          Pensando...
          <div className="ml-2 mt-1">
            <CrazySpinner />
          </div>
        </div>
      )}
      {!isLoading && (
        <>
          <div className="relative">
            <CommandInput
              value={inputValue}
              onValueChange={setInputValue}
              autoFocus
              placeholder={hasCompletion ? "Diga à IA o que fazer a seguir." : "Peça à IA para editar ou gerar..."}
              // @ts-ignore
              onFocus={() => addAIHighlight(editor)}
            />
            <Button
              size="icon"
              className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-blue-500 hover:bg-blue-900"
              onClick={() => {
                if (completion)
                  return complete(completion, {
                    body: { option: "zap", command: inputValue },
                  }).then(() => setInputValue(""));
                // @ts-ignore
                const slice = editor.state.selection.content();
                // @ts-ignore
                const text = editor.storage.markdown.serializer.serialize(slice.content);

                complete(text, {
                  body: { option: "zap", command: inputValue },
                }).then(() => setInputValue(""));
              }}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
          {hasCompletion ? (
            <AICompletionCommands
              onDiscard={() => {
                // @ts-ignore
                editor.chain().unsetHighlight().focus().run();
                onOpenChange(false);
              }}
              completion={completion}
            />
          ) : (
            <AISelectorCommands onSelect={(value, option) => complete(value, { body: { option } })} />
          )}
        </>
      )}
    </Command>
  );
}
