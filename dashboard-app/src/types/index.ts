export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  department?: string;
  position?: string;
  is_active: boolean;
  email_verified: boolean;
  last_login?: string;
  created_at: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date?: string;
  end_date?: string;
  budget?: number;
  owner_id?: number;
  owner_name?: string;
  task_count?: number;
  completed_tasks?: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  project_id?: number;
  project_name?: string;
  assigned_to?: number;
  assigned_to_name?: string;
  created_by?: number;
  created_by_name?: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  overview?: {
    totalProjects: number;
    totalTasks: number;
    totalUsers: number;
  };
  projectsByStatus?: Array<{ status: string; count: string }>;
  tasksByStatus?: Array<{ status: string; count: string }>;
  tasksByPriority?: Array<{ priority: string; count: string }>;
  recentProjects?: Project[];
  recentTasks?: Task[];
  upcomingDeadlines?: Task[];
  teamPerformance?: Array<{
    id: number;
    name: string;
    department: string;
    total_tasks: string;
    completed_tasks: string;
    in_progress_tasks: string;
  }>;
  // User-specific stats
  myProjects?: Project[];
  myTasks?: Task[];
  myTaskStats?: {
    total: number;
    completed: number;
    in_progress: number;
    todo: number;
  };
}

export interface AuthResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}
