export interface AdemicSubjectsProps {
  id: string
  available: boolean
  name: string
  slug: string
  topics?: AdemicTopicsProps[]
}

export interface AdemicTopicsProps {
  id: string
  name: string
}

export interface MateriaisProps {
  id: string
  createdAt: string
  updatedAt: string
  aiModel: string
  content: string
  type: string
  title: string
  creditsId: number
}