import { Check, TextQuote, TrashIcon } from "lucide-react";
import { useEditor } from "novel";
import { CommandGroup, CommandItem, CommandSeparator } from "../ui/command";

const AICompletionCommands = ({
  completion,
  onDiscard,
}: {
  completion: string;
  onDiscard: () => void;
}) => {
  const { editor } = useEditor();
  return (
    <>
      <CommandGroup>
        <CommandItem
          className="gap-2 px-4"
          value="replace"
          onSelect={() => {
            const selection = editor?.view.state.selection;

            editor?.chain()
              .focus()
              .insertContentAt(
                {
                  from: selection?.from ?? 0,
                  to: selection?.to ?? 0,
                },
                completion,
              )
              .run();
          }}
        >
          <Check className="h-4 w-4 text-blue-foreground" />
          Substituir seleção
        </CommandItem>
        <CommandItem
          className="gap-2 px-4"
          value="insert"
          onSelect={() => {
            const selection = editor?.view.state.selection;
            editor?.chain()
              .focus()
              .insertContentAt((selection?.to ?? 0) + 1, completion)
              .run();
          }}
        >
          <TextQuote className="h-4 w-4 text-blue-foreground" />
          Insira abaixo
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />

      <CommandGroup>
        <CommandItem onSelect={onDiscard} value="thrash" className="gap-2 px-4">
          <TrashIcon className="h-4 w-4 text-blue-foreground" />
          Descartar
        </CommandItem>
      </CommandGroup>
    </>
  );
};

export default AICompletionCommands;
