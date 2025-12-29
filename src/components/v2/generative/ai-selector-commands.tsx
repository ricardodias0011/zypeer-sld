import { ArrowDownWideNarrow, CheckCheck, RefreshCcwDot, StepForward, WrapText } from "lucide-react";
import { getPrevText, useEditor } from "novel";
import { CommandGroup, CommandItem, CommandSeparator } from "../ui/command";

const options = [
  {
    value: "Aprimore a escrita",
    label: "Aprimore a escrita",
    icon: RefreshCcwDot,
  },
  {
    value: "Corrigir gramática",
    label: "Corrigir gramática",
    icon: CheckCheck,
  },
  {
    value: "mais curto",
    label: "Cais curto",
    icon: ArrowDownWideNarrow,
  },
  {
    value: "Mais longo",
    label: "Mais longo",
    icon: WrapText,
  },
];

interface AISelectorCommandsProps {
  onSelect: (value: string, option: string) => void;
}

const AISelectorCommands = ({ onSelect }: AISelectorCommandsProps) => {
  const { editor } = useEditor();

  return (
    <>
      <CommandGroup heading="Edit or review selection">
        {options.map((option) => (
          <CommandItem
            onSelect={(value) => {
              const slice = editor?.state.selection.content();
              const text = editor?.storage.markdown.serializer.serialize(slice?.content);
              onSelect(text, value);
            }}
            className="flex gap-2 px-4"
            key={option.value}
            value={option.value}
          >
            <option.icon className="h-4 w-4 text-blue-500" />
            {option.label}
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Use AI to do more">
        <CommandItem
          onSelect={() => {
            const pos = editor?.state.selection.from;
            if (editor) {
              const text = getPrevText(editor, pos as number);
              onSelect(text, "Continue escrevendo");
            }
          }}
          value="Continue escrevendo"
          className="gap-2 px-4"
        >
          <StepForward className="h-4 w-4 text-blue-500" />
          Continue escrevendo
        </CommandItem>
      </CommandGroup>
    </>
  );
};

export default AISelectorCommands;
