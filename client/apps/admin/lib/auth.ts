export const auth = {
  saveToken(token: string) {
    localStorage.setItem("token", token);
  },

  getToken() {
    return localStorage.getItem("token");
  },

  saveUser(user: unknown) {
    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );
  },

  getUser() {
    const user =
      localStorage.getItem("user");

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
    console.log(
      "ADMIN AUTH: Logging out..."
    );

    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  /*
   * ============================================================
   * CHECK JWT EXPIRATION
   * ============================================================
   */
  isTokenExpired() {
    const token = this.getToken();

    /*
     * No token = not authenticated.
     */
    if (!token) {
      return true;
    }

    try {
      const parts = token.split(".");

      /*
       * JWT format:
       * header.payload.signature
       */
      if (parts.length !== 3) {
        return true;
      }

      const payloadPart = parts[1];

      /*
       * Prevent:
       * Object is possibly 'undefined'
       */
      if (!payloadPart) {
        return true;
      }

      /*
       * JWT uses Base64URL encoding.
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

      /*
       * Decode JWT payload.
       */
      const payload = JSON.parse(
        atob(paddedBase64)
      );

      /*
       * If there is no exp property,
       * allow the backend to validate it.
       */
      if (
        typeof payload.exp !== "number"
      ) {
        return false;
      }

      /*
       * JWT expiration is in seconds.
       * JavaScript Date.now() is milliseconds.
       */
      const expirationTime =
        payload.exp * 1000;

      return (
        Date.now() >= expirationTime
      );
    } catch (error) {
      console.error(
        "ADMIN TOKEN VALIDATION ERROR:",
        error
      );

      /*
       * Invalid/malformed token.
       * Treat it as expired.
       */
      return true;
    }
  },
};