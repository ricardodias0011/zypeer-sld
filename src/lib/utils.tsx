import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function getLetterByIndex(index: number): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return alphabet[index % alphabet.length];
}


export function textColorFromHex(hex: string): "light" | "dark" {
  const c = hex.replace("#", "");
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b);

  return luminance > 186 ? "dark" : "light"; // 186 é o threshold clássico
}

export const organizeArray = (array1: string[], array2: { id?: string }[] | null): any[] => {
  const newArray = array1?.map((item) => {
    if (!item) {
      return
    }
    if (!array2) {
      return
    }
    const objetoCorrespondente = array2?.find(obj => obj.id === item);
    if (!objetoCorrespondente) {
      return
    }
    if (objetoCorrespondente) {
      return objetoCorrespondente;
    }
  });
  return newArray
}


export const difficultyLevel = [
  "1° Ano (ensino Médio)",
  "2° Ano (ensino Médio)",
  "3° Ano (ensino Médio)",
  "1º Ano (Ensino Fundamental)",
  "2º Ano (Ensino Fundamental)",
  "3º Ano (Ensino Fundamental)",
  "4º Ano (Ensino Fundamental)",
  "5º Ano (Ensino Fundamental)",
  "6º Ano (Ensino Fundamental)",
  "7º Ano (Ensino Fundamental)",
  "8º Ano (Ensino Fundamental)",
  "9º Ano (Ensino Fundamental)",
  "Universade",
  "Educação infantil",
]

export function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  return /android|iphone|ipad|ipod|windows phone/i.test(userAgent);
}

export function isDesktop(): boolean {
  return !isMobile();
}
