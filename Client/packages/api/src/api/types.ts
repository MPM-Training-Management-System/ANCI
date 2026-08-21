export interface ApiClientOptions {
  baseUrl: string;
  getToken?: () => Promise<string | null> | string | null;
}

export interface ApiRequestOptions
  extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}


