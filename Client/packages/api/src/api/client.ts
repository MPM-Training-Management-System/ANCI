import {
  ApiClientOptions,
  ApiRequestOptions,
} from "./types";

export class ApiClient {
  constructor(
    private readonly options: ApiClientOptions
  ) {}

  async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {

    const token = this.options.getToken
      ? await this.options.getToken()
      : null;

    const headers = new Headers(options.headers);

    headers.set("Content-Type", "application/json");

    if (token) {
      headers.set(
        "Authorization",
        `Bearer ${token}`
      );
    }

    const response = await fetch(
      `${this.options.baseUrl}${endpoint}`,
      {
        ...options,
        headers,
        body:
          options.body !== undefined
            ? JSON.stringify(options.body)
            : undefined,
      }
    );

    if (!response.ok) {
      let message = "Something went wrong.";

      try {
        message = await response.text();
      } catch {}

      throw new Error(message);
    }

    return response.json() as Promise<T>;
  }

  get<T>(url: string) {
    return this.request<T>(url, {
      method: "GET",
    });
  }

  post<T>(
    url: string,
    body?: unknown
  ) {
    return this.request<T>(url, {
      method: "POST",
      body,
    });
  }

  put<T>(
    url: string,
    body?: unknown
  ) {
    return this.request<T>(url, {
      method: "PUT",
      body,
    });
  }

  patch<T>(
    url: string,
    body?: unknown
  ) {
    return this.request<T>(url, {
      method: "PATCH",
      body,
    });
  }

  delete<T>(url: string) {
    return this.request<T>(url, {
      method: "DELETE",
    });
  }
}