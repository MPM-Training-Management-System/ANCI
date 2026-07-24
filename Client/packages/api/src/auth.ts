export const auth = {
  saveToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  },

  getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
},

  saveUser(user: unknown) {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }
  },

  getUser() {
    if (typeof window === "undefined") {
      return null;
    }

    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};