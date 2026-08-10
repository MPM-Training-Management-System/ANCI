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

    const url =
      `${this.options.baseUrl}${endpoint}`;

    console.log(
      "================================"
    );

    console.log("API REQUEST");
    console.log("URL:", url);
    console.log(
      "METHOD:",
      options.method ?? "GET"
    );
    console.log(
      "HAS TOKEN:",
      !!token
    );

    console.log(
      "================================"
    );

    const headers = new Headers(
      options.headers
    );

    const isFormData =
      options.body instanceof FormData;

    if (!isFormData) {
      headers.set(
        "Content-Type",
        "application/json"
      );
    }

    if (token) {
      headers.set(
        "Authorization",
        `Bearer ${token}`
      );
    }

    let body: BodyInit | undefined;

    if (
      options.body === undefined
    ) {
      body = undefined;
    } else if (isFormData) {
      body =
        options.body as FormData;
    } else {
      body = JSON.stringify(
        options.body
      );
    }

    try {
      const response = await fetch(
        url,
        {
          ...options,
          headers,
          body,
        }
      );

      console.log(
        "STATUS:",
        response.status
      );

      console.log(
        "STATUS TEXT:",
        response.statusText
      );

      const contentType =
        response.headers.get(
          "content-type"
        );

      console.log(
        "CONTENT TYPE:",
        contentType
      );

      /*
       * Read response body ONCE.
       */
      const text =
        await response.text();

      console.log(
        "RESPONSE:",
        text
      );

      /*
       * Handle HTTP errors
       */
      if (!response.ok) {
        let message =
          "Something went wrong.";

        if (text) {
          try {
            const error =
              JSON.parse(text);

            message =
              error.message ??
              error.title ??
              error.error ??
              JSON.stringify(error);
          } catch {
            message = text;
          }
        }

        throw new Error(
          `HTTP ${response.status}: ${message}`
        );
      }

      /*
       * Handle empty response
       */
      if (
        response.status === 204 ||
        !text
      ) {
        return undefined as T;
      }

      /*
       * Parse JSON response
       */
      try {
        return JSON.parse(
          text
        ) as T;
      } catch {
        /*
         * In case backend returns
         * plain text instead of JSON.
         */
        return text as T;
      }
    } catch (error) {
      console.error(
        "API REQUEST ERROR:",
        error
      );

      throw error;
    }
  }

  get<T>(url: string) {
    return this.request<T>(
      url,
      {
        method: "GET",
      }
    );
  }

  post<T>(
    url: string,
    body?: unknown
  ) {
    return this.request<T>(
      url,
      {
        method: "POST",
        body,
      }
    );
  }

  put<T>(
    url: string,
    body?: unknown
  ) {
    return this.request<T>(
      url,
      {
        method: "PUT",
        body,
      }
    );
  }

  patch<T>(
    url: string,
    body?: unknown
  ) {
    return this.request<T>(
      url,
      {
        method: "PATCH",
        body,
      }
    );
  }

  delete<T>(url: string) {
    return this.request<T>(
      url,
      {
        method: "DELETE",
      }
    );
  }
}