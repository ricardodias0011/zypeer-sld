import {
  CheckSquare,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Text,
  TextQuote
} from "lucide-react";
import { Command, createSuggestionItems, renderItems } from "novel";

export const suggestionItems = createSuggestionItems([
  // {
  //   title: "Send Feedback",
  //   description: "Let us know how we can improve.",
  //   icon: <MessageSquarePlus size={18} />,
  //   command: ({ editor, range }) => {
  //     editor.chain().focus().deleteRange(range).run();
  //     window.open("/feedback", "_blank");
  //   },
  // },
  {
    title: "Texto",
    description: "Basta começar a digitar com texto simples.",
    searchTerms: ["p", "parágrafo"],
    icon: <Text size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleNode("paragraph", "paragraph").run();
    },
  },
  {
    title: "Lista de Tarefas",
    description: "Acompanhe tarefas com uma lista de afazeres.",
    searchTerms: ["todo", "tarefa", "lista", "check", "checkbox"],
    icon: <CheckSquare size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Título 1",
    description: "Título grande de seção.",
    searchTerms: ["titulo", "grande", "maior"],
    icon: <Heading1 size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
    },
  },
  {
    title: "Título 2",
    description: "Título médio de seção.",
    searchTerms: ["subtitulo", "medio"],
    icon: <Heading2 size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
    },
  },
  {
    title: "Título 3",
    description: "Título pequeno de seção.",
    searchTerms: ["subtitulo", "pequeno"],
    icon: <Heading3 size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
    },
  },
  {
    title: "Lista com Marcadores",
    description: "Crie uma lista simples com marcadores.",
    searchTerms: ["não ordenada", "ponto"],
    icon: <List size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Lista Numerada",
    description: "Crie uma lista com numeração.",
    searchTerms: ["ordenada"],
    icon: <ListOrdered size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Citação",
    description: "Insira uma citação.",
    searchTerms: ["blockquote"],
    icon: <TextQuote size={18} />,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleNode("paragraph", "paragraph").toggleBlockquote().run(),
  },
  {
    title: "Código",
    description: "Insira um trecho de código.",
    searchTerms: ["codeblock"],
    icon: <Code size={18} />,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  // {
  //   title: "Imagem",
  //   description: "Envie uma imagem do seu computador.",
  //   searchTerms: ["foto", "imagem", "mídia"],
  //   icon: <ImageIcon size={18} />,
  //   command: ({ editor, range }) => {
  //     editor.chain().focus().deleteRange(range).run();
  //     // upload da imagem
  //     const input = document.createElement("input");
  //     input.type = "file";
  //     input.accept = "image/*";
  //     input.onchange = async () => {
  //       if (input.files?.length) {
  //         const file = input.files[0];
  //         const pos = editor.view.state.selection.from;
  //         uploadFn(file, editor.view, pos);
  //       }
  //     };
  //     input.click();
  //   },
  // },

  // {
  //   title: "Youtube",
  //   description: "Embed a Youtube video.",
  //   searchTerms: ["video", "youtube", "embed"],
  //   icon: <Youtube size={18} />,
  //   command: ({ editor, range }) => {
  //     const videoLink = prompt("Please enter Youtube Video Link");
  //     //From https://regexr.com/3dj5t
  //     const ytregex = new RegExp(
  //       /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/,
  //     );

  //     if (ytregex.test(videoLink ?? "")) {
  //       editor
  //         .chain()
  //         .focus()
  //         .deleteRange(range)
  //         .setYoutubeVideo({
  //           src: videoLink ?? "",
  //         })
  //         .run();
  //     } else {
  //       if (videoLink !== null) {
  //         alert("Please enter a correct Youtube Video Link");
  //       }
  //     }
  //   },
  // },
  // {
  //   title: "Twitter",
  //   description: "Embed a Tweet.",
  //   searchTerms: ["twitter", "embed"],
  //   icon: <Twitter size={18} />,
  //   command: ({ editor, range }) => {
  //     const tweetLink = prompt("Please enter Twitter Link");
  //     const tweetRegex = new RegExp(/^https?:\/\/(www\.)?x\.com\/([a-zA-Z0-9_]{1,15})(\/status\/(\d+))?(\/\S*)?$/);

  //     if (tweetRegex.test(tweetLink ?? "")) {
  //       editor
  //         .chain()
  //         .focus()
  //         .deleteRange(range)
  //         .setTweet({
  //           src: tweetLink ?? "",
  //         })
  //         .run();
  //     } else {
  //       if (tweetLink !== null) {
  //         alert("Please enter a correct Twitter Link");
  //       }
  //     }
  //   },
  // },
  // {
  //   title: "Head",
  //   description: "Adicionar capa com título, subtítulo e imagem",
  //   icon: <Youtube />,
  //   command: ({ editor }) => {
  //     editor.chain().focus().insertContent({
  //       type: "head",
  //       attrs: { title: "Meu título", subtitle: "Meu subtítulo", image: "" }
  //     }).run();
  //   },
  // }
]);

export const slashCommand = Command.configure({
  suggestion: {
    items: () => suggestionItems,
    render: renderItems,
  },
});
