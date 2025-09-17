export const fontOptions = [
  { label: "Poppins", value: "Poppins" },
  { label: "Roboto", value: "Roboto" },
  { label: "Montserrat", value: "Montserrat" },
  { label: "Oswald", value: "Oswald" },
  { label: "Open sans", value: "Open sans" },
  { label: "Manufacturing", value: "Manufacturing Consent" },
  { label: "Inter", value: "Inter" },
  { label: "Lato", value: "Lato" },
  { label: "Nunito", value: "Nunito" },
  { label: "My Soul", value: "My Soul" },
  { label: "Bebas Neue", value: "Bebas Neue" },
  { label: "Bungee", value: "Bungee" },
  { label: "Arvo", value: "Arvo" },
  { label: "Play", value: "Play" },
  { label: "Syne", value: "Syne" }
];

function inferWeightFromUrl(url: string): string | undefined {
  const lower = url.toLowerCase();
  if (lower.includes("thin")) return "100";
  if (lower.includes("extralight")) return "200";
  if (lower.includes("light")) return "300";
  if (lower.includes("regular")) return "400";
  if (lower.includes("medium")) return "500";
  if (lower.includes("semibold")) return "600";
  if (lower.includes("bold")) return "700";
  if (lower.includes("extrabold")) return "800";
  if (lower.includes("black")) return "900";
  return undefined;
}
interface FontEntry {
  label: string;
  value: string;
  links: string[];
}

const isFontLoaded = async (fontName: string) => {
  try {
    await document.fonts.load(`1em "${fontName}"`);
    return [...document.fonts].some(face => face.family === fontName && face.status === "loaded");
  } catch {
    return false;
  }
};


export const loadFontFromServer = async (fontEntry: FontEntry) => {
  const { value: fontName, links } = fontEntry;
  console.log(document.fonts.check(`1em "${fontName}"`))
  if (await isFontLoaded(fontName)) {
    console.log(`Fonte "${fontName}" já carregada.`);
    return;
  }

  const cssLinks = links.filter(url => url.endsWith("swap"));
  const fontLinks = links.filter(url => !url.endsWith("swap"));
  console.log(cssLinks)

  if (cssLinks.length) {
    console.log(cssLinks)
    cssLinks.forEach(url => {
      const linkEl = document.createElement("link");
      linkEl.rel = "stylesheet";
      linkEl.href = url;
      document.head.appendChild(linkEl);
      console.log(`CSS font link added: ${url}`);
    });
  }

  const loadPromises = fontLinks.map((url) => {
    const weight = inferWeightFromUrl(url);
    const fontFace = new FontFace(fontName, `url(${url})`, {
      style: "normal",
      weight: weight ?? "400",
      display: "swap"
    });

    return fontFace.load().then((loadedFace) => {
      document.fonts.add(loadedFace);
      console.log(`Font "${fontName}" loaded from ${url}`);
    }).catch((err) => {
      console.warn(`Failed to load font "${fontName}" from ${url}:`, err);
    });
  });

  if (loadPromises.length) {
    await Promise.all(loadPromises);
  }

  await document.fonts.load(`1em "${fontName}"`);
};
