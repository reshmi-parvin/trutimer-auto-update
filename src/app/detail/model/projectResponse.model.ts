// Define an interface for the response data
export interface ProjectResponse {
    result: {
      totalCount: number;
      items: ProjectItem[];
    };
    targetUrl: string | null;
    success: boolean;
    error: any | null;
    unAuthorizedRequest: boolean;
    __abp: boolean;
  }
  // Define an interface for the items in the "items" array
  interface ProjectItem {
    id: number;
    name: string;
    baseUrl: string;
    baseUrlId: number;
  }

//export type ProjectResponse = UnifiedProjectResponse | EmptyProjectResponse;

interface EmptyProjectResponse {
  result: {
    totalCount: 0;
    items: [];
  };
  targetUrl: string | null;
  success: boolean;
  error: any | null;
  unAuthorizedRequest: boolean;
  __abp: boolean;
}