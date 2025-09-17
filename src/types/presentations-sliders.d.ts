import type { Shape } from "./editor"

export interface PresentationProject {
  id: string
  isPublic: boolean
  order: any[]
  title: string
  templateId: string
  presentations: PresentationSlide[]
  created_at?: string;
  effectTransition?: string;
  updated_at?: string;
  thumbnail?: string;
  thumbnailId?: string
}

export interface UpdatePresentationProject {
  isPublic?: boolean
  order?: any[]
  title?: string
  presentations?: PresentationSlide[]
  effectTransition?: string;
}


export interface PresentationSlide {
  id: string
  theme: Theme
  background: Background
  imagePosition: "Right" | "left" | "full" | "top" | "bottom" | "default" | "side-left" | "side-right",
  thumbnailId?: string,
  thumbnail?: string
  items: Shape[]
}

export interface Theme { }

export interface Background {
  type: "image" | "color" | "gradient"
  url?: string,
  color?: string | string[]
}

export interface Crop {
  x: number
  y: number
  height: number
  width: number
}

export interface Layout {
  font_size_offset: number
  alignment_x: number
  alignment_y: number
  type: string
  size: string | number;
}