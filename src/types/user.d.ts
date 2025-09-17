export interface UserProps {
  sub: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  avatar: string;
  email: string;
  name: string;
  plan_account_type: "free" | "basic" | "standerd" | "full";
  grant_type?: "teacher" | "student"
  total_create_activitys: number
  total_create_answers: number
  credits: number;
  phone: string;
  address: {
    cep: string
    city: string
    uf: string
    street: string
    district: string
    number: string
    complement: string
  }
}

export interface FilesProps {
  id: string
  filename: string
  link: string
  key: string
  type: string
  userId: string
  size: string
  typeSend: string
  createdAt: Date
  updatedAt: Date
}


export interface FilesUpdate {
  destinationResources: string[];
  sourceResouces?: string[]
  files?: {
    destinationId: string
    sourceId: string
    id: string
  }
}