export const auth = {
  saveToken(token: string) {
    localStorage.setItem("token", token);
  },

  getToken() {
    return localStorage.getItem("token");
  },

  saveUser(user: unknown) {
    localStorage.setItem("user", JSON.stringify(user));
  },

  getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};