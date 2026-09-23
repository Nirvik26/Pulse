export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  taskId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  projectId?: string;
  project?: { id?: string; name: string; color: string };
  subtasks?: Subtask[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  status: string;
  tasks: Task[];
  createdAt?: string;
  _count?: { tasks: number };
}

export interface Activity {
  id: string;
  type: string;
  message: string;
  metadata?: string;
  createdAt: string;
  project?: { name: string; color: string };
  task?: { title: string };
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id?: string;
    name: string | null;
    image: string | null;
    email: string | null;
  };
}
