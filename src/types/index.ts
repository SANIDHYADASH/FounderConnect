export type UserRole = 'founder' | 'developer';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  githubProfile?: string;
  whatsappNumber?: string;
}

export interface StartupIdea {
  id: string;
  founderId: string;
  title: string;
  description: string;
  equityRange: string;
  salaryRange: string;
  skills: string[];
  createdAt: Date;
}

export interface Application {
  id: string;
  ideaId: string;
  developerId: string;
  proposal: string;
  equityRequest: string;
  salaryRequest: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}