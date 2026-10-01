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

    console.log(
      "API REQUEST"
    );

    console.log(
      "URL:",
      url
    );

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

    const headers =
      new Headers(options.headers);

    const isFormData =
      options.body instanceof FormData;

    /*
     * Do not manually set Content-Type
     * when using FormData.
     *
     * The browser will automatically set:
     * multipart/form-data; boundary=...
     */
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

    let body:
      | BodyInit
      | undefined;

    if (
      options.body === undefined
    ) {
      body = undefined;
    } else if (isFormData) {
      const formData =
        options.body as FormData;

      console.log(
        "================================"
      );

      console.log(
        "FORMDATA DEBUG"
      );

      console.log(
        "URL:",
        url
      );

      console.log(
        "METHOD:",
        options.method ?? "GET"
      );

      console.log(
        "HAS GoogleIdToken:",
        formData.has(
          "GoogleIdToken"
        )
      );

      const googleIdToken =
        formData.get(
          "GoogleIdToken"
        );

      console.log(
        "GoogleIdToken:",
        typeof googleIdToken === "string"
          ? `FOUND (${googleIdToken.length} chars)`
          : "MISSING"
      );

      console.log(
        "FORMDATA FIELDS:"
      );

      for (
        const [key, value]
        of formData.entries()
      ) {
        if (
          key === "GoogleIdToken"
        ) {
          console.log(
            `${key}:`,
            typeof value === "string"
              ? `FOUND (${value.length} chars)`
              : "INVALID"
          );

          continue;
        }

        if (
          typeof File !== "undefined" &&
          value instanceof File
        ) {
          console.log(
            `${key}: FILE`,
            {
              name: value.name,
              type: value.type,
              size: value.size,
            }
          );

          continue;
        }

        console.log(
          `${key}:`,
          value
        );
      }

      console.log(
        "================================"
      );

      /*
       * IMPORTANT:
       *
       * FormData must be passed directly.
       * Do NOT JSON.stringify(FormData).
       */

      body = formData;
    } else {
      body = JSON.stringify(
        options.body
      );
    }

    try {
      const response =
        await fetch(url, {
          ...options,
          headers,
          body,
        });

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

      const text =
        await response.text();

      console.log(
        "RESPONSE:",
        text
      );

      /*
       * ==========================================================
       * 401 UNAUTHORIZED
       * ==========================================================
       */

      if (
        response.status === 401
      ) {
        console.error(
          "================================"
        );

        console.error(
          "UNAUTHORIZED - SESSION EXPIRED"
        );

        console.error(
          "URL:",
          url
        );

        console.error(
          "================================"
        );

        this.options
          .onUnauthorized?.();

        if (
          typeof window !==
          "undefined"
        ) {
          window.dispatchEvent(
            new CustomEvent(
              "auth:unauthorized"
            )
          );
        }

        throw new Error(
          "Your session has expired. Please login again."
        );
      }

      /*
       * ==========================================================
       * OTHER API ERRORS
       * ==========================================================
       */

      if (!response.ok) {
        let message =
          "Something went wrong.";

        console.error(
          "================================"
        );

        console.error(
          "API ERROR"
        );

        console.error(
          "STATUS:",
          response.status
        );

        console.error(
          "STATUS TEXT:",
          response.statusText
        );

        console.error(
          "URL:",
          url
        );

        console.error(
          "RAW RESPONSE:",
          text
        );

        console.error(
          "================================"
        );

        if (text) {
          try {
            const error =
              JSON.parse(text);

            console.error(
              "API ERROR JSON:",
              JSON.stringify(
                error,
                null,
                2
              )
            );

            if (error.errors) {
              const validationErrors =
                Object.entries(
                  error.errors
                )
                  .flatMap(
                    ([
                      field,
                      messages,
                    ]) => {
                      if (
                        Array.isArray(
                          messages
                        )
                      ) {
                        return messages.map(
                          (message) =>
                            `${field}: ${message}`
                        );
                      }

                      return [
                        `${field}: ${String(
                          messages
                        )}`,
                      ];
                    }
                  )
                  .join("\n");

              message =
                validationErrors ||
                error.message ||
                error.title ||
                error.error ||
                JSON.stringify(
                  error
                );
            } else {
              message =
                error.message ??
                error.title ??
                error.error ??
                JSON.stringify(
                  error
                );
            }
          } catch {
            message = text;
          }
        }

        throw new Error(
          `HTTP ${response.status}: ${message}`
        );
      }

      /*
       * ==========================================================
       * NO CONTENT
       * ==========================================================
       */

      if (
        response.status === 204 ||
        !text
      ) {
        return undefined as T;
      }

      /*
       * ==========================================================
       * JSON
       * ==========================================================
       */

      try {
        return JSON.parse(
          text
        ) as T;
      } catch {
        /*
         * Plain text response
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