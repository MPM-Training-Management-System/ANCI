export interface ApiClientOptions {
  baseUrl: string;

  getToken?: () => string | null | Promise<string | null>;

  onUnauthorized?: () => void;
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


