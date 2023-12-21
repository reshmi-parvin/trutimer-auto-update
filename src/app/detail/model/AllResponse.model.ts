export interface UserProfileResponse {
  result: {
    name: string;
    surname: string;
    profilePicture: string;
    id: number;
  };
  targetUrl: string | null;
  success: boolean;
  error: any | null;
  unAuthorizedRequest: boolean;
  __abp: boolean;
}

export interface IssuesProjectWise {
  id: number;
  issuename: string;
  trackTime: string;
  projectid: number;
  projectname: string;
  baseUrlId: number;
}

export interface GetUtcTimeResponse {
  result: string;
  targetUrl: string | null;
  success: boolean;
  error: any | null;
  unAuthorizedRequest: boolean;
  __abp: boolean;
}

export interface GetTasksWithTimeByUsersAndProject {
  result: {
    totalCount: number;
    items: TasksItem[];
  };
  targetUrl: string | null;
  success: boolean;
  error: any | null;
  unAuthorizedRequest: boolean;
  __abp: boolean;
}
interface TasksItem {
  id: number;
  project: {
    id: number;
    name: string;
  };
  tracker: {
    id: number;
    name: string;
  };
  status: {
    id: number;
    name: string;
  };
  priority: {
    id: number;
    name: string;
  };
  author: {
    id: number;
    name: string;
  };
  assigned_to: {
    id: number;
    name: string;
  };
  subject: string;
  description: string;
  start_date: string;
  due_date: string | null;
  done_ratio: number;
  is_private: boolean;
  estimated_hours: number | null;
  created_on: string;
  updated_on: string;
  closed_on: string | null;
  parent: any | null;
  timeDuration: string | null;
  trackTime: string;
}

export interface GetProjectLastTrackedTime {
  result: {
    lastTaskID: number;
    lastTaskName: string;
    totalTrackedTime: string;
    lastProjectId: number;
    lastProjectName: string;
    lastIssueTrackedTime: string;
    sourceCode: string;
  };
  targetUrl: string | null;
  success: boolean;
  error: any | null;
  unAuthorizedRequest: boolean;
  __abp: boolean;
}

export interface GetAllSourceType {
  result: {
    totalCount: number;
    items: AllSourceItems[];
  };
  targetUrl: string | null;
  success: boolean;
  error: any | null;
  unAuthorizedRequest: boolean;
  __abp: boolean;
}
interface AllSourceItems {
  sourceName: string;
  sourceCode: string;
  id: 1;
}

interface SourceApi {
  id: number;
  baseUrl: string;
  apiKey: string;
}

interface SourceItem {
  sourceTypeId: number;
  userId: number;
  sourceCode: string;
  sourceName: string;
  baseApiUrls: SourceApi[];
  employeeName: string | null;
  isDeleted: boolean;
  deleterUserId: number | null;
  deletionTime: string | null;
  lastModificationTime: string | null;
  lastModifierUserId: number | null;
  creationTime: string;
  creatorUserId: number | null;
  id: number;
}

export interface UserApiResponse {
  result: SourceItem[];
  targetUrl: string | null;
  success: boolean;
  error: any | null;
  unAuthorizedRequest: boolean;
  __abp: boolean;
}

export interface EmptyResponse {
  result: any[];
  targetUrl: string | null;
  success: boolean;
  error: any | null;
  unAuthorizedRequest: boolean;
  __abp: boolean;
}

export interface DeleteResponse {
  result: any | null;
  targetUrl: string | null;
  success: boolean;
  error: any | null;
  unAuthorizedRequest: boolean;
  __abp: boolean;
}

export interface CreateOrUpdateUserKeyResponse {
  result: any | null;
  targetUrl: string | null;
  success: boolean;
  error: any | null;
  unAuthorizedRequest: boolean;
  __abp: boolean;
}

interface Project {
  id: number;
  name: string;
  baseUrl: string;
  baseUrlId: number;
}

export interface SearchProjectResponse {
  result: Project[];
  targetUrl: string | null;
  success: boolean;
  error: any | null;
  unAuthorizedRequest: boolean;
  __abp: boolean;
}

export interface RecentTasks {
  result: RecentTasksData[];
  targetUrl: string | null;
  success: boolean;
  error: string | null;
  unAuthorizedRequest: boolean;
  __abp: boolean;
}

interface RecentTasksData {
  projectId: number;
  projectName: string;
  taskId: number;
  taskName: string;
  sourceCode: string;
}

interface Project {
  id: number;
  name: string;
  baseUrl: string;
  baseUrlId: number;
}

export interface SearchProjectResponse {
  result: Project[];
  targetUrl: string | null;
  success: boolean;
  error: any | null;
  unAuthorizedRequest: boolean;
  __abp: boolean;
}

export interface SearchTaskResponse {
  result: Project[];
  targetUrl: string | null;
  success: boolean;
  error: any | null;
  unAuthorizedRequest: boolean;
  __abp: boolean;
}
