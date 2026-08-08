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

const isFormData = options.body instanceof FormData;

if (!isFormData) {
  headers.set("Content-Type", "application/json");
}

if (token) {
  headers.set("Authorization", `Bearer ${token}`);
}

let body: BodyInit | undefined;

if (options.body === undefined) {
  body = undefined;
} else if (isFormData) {
  body = options.body as FormData;
} else {
  body = JSON.stringify(options.body);
}

const response = await fetch(
  `${this.options.baseUrl}${endpoint}`,
  {
    ...options,
    headers,
    body,
  }
);

    if (!response.ok) {
      let message = "Something went wrong.";

      try {
        const contentType =
          response.headers.get("content-type");

        if (
          contentType?.includes("application/json")
        ) {
          const error =
            await response.json();

          message =
            error.message ??
            JSON.stringify(error);
        } else {
          message =
            await response.text();
        }
      } catch {}

      throw new Error(message);
    }

    // Handle empty response
    if (response.status === 204) {
      return undefined as T;
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