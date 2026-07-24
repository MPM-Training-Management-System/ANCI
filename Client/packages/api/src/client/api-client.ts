import { auth } from "../auth";

export class ApiClient {
  constructor(private readonly baseUrl: string) {}

  async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const token = auth.getToken();

    const response = await fetch(
      `${this.baseUrl}${endpoint}`,
      {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : {}),
          ...options?.headers,
        },
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json() as Promise<T>;
  }
}