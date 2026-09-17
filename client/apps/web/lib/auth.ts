export const auth = {
  saveToken(token: string) {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem("token", token);
  },

  getToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("token");
  },

  saveUser(user: unknown) {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );
  },

  getUser() {
    if (typeof window === "undefined") {
      return null;
    }

    const user = localStorage.getItem("user");

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  },

  logout() {
    if (typeof window === "undefined") {
      return;
    }

    console.log(
      "================================"
    );

    console.log(
      "AUTH LOGOUT"
    );

    console.log(
      "Clearing token and user..."
    );

    console.log(
      "================================"
    );

    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Checks whether the JWT is expired.
   *
   * NOTE:
   * This is only a client-side expiration check.
   * The backend is still responsible for
   * validating the actual JWT.
   */
  isTokenExpired() {
    const token = this.getToken();

    if (!token) {
      return true;
    }

    try {
      const parts = token.split(".");

      /*
       * JWT must have:
       * header.payload.signature
       */
      if (parts.length !== 3) {
        return true;
      }

      const payloadPart = parts[1];

      /*
       * Fix for:
       * Object is possibly 'undefined'
       */
      if (!payloadPart) {
        return true;
      }

      /*
       * JWT uses Base64URL.
       */
      const base64 = payloadPart
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      /*
       * Add missing Base64 padding.
       */
      const paddedBase64 = base64.padEnd(
        base64.length +
          ((4 - (base64.length % 4)) % 4),
        "="
      );

      const payload = JSON.parse(
        atob(paddedBase64)
      );

      /*
       * If there is no expiration field,
       * let the backend determine whether
       * the token is still valid.
       */
      if (
        typeof payload.exp !== "number"
      ) {
        return false;
      }

      /*
       * JWT exp is in seconds.
       */
      const expirationTime =
        payload.exp * 1000;

      return Date.now() >= expirationTime;
    } catch (error) {
      console.error(
        "TOKEN VALIDATION ERROR:",
        error
      );

      /*
       * If the token cannot be decoded,
       * consider it invalid.
       */
      return true;
    }
  },
};