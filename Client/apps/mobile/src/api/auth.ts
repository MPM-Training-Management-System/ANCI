import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const auth = {
  async saveToken(
    token: string
  ) {
    await SecureStore.setItemAsync(
      TOKEN_KEY,
      token
    );
  },

  async getToken() {
    return await SecureStore.getItemAsync(
      TOKEN_KEY
    );
  },

  async saveUser(
    user: unknown
  ) {
    await SecureStore.setItemAsync(
      USER_KEY,
      JSON.stringify(user)
    );
  },

  async getUser() {
    const user =
      await SecureStore.getItemAsync(
        USER_KEY
      );

    return user
      ? JSON.parse(user)
      : null;
  },

  async logout() {
    await SecureStore.deleteItemAsync(
      TOKEN_KEY
    );

    await SecureStore.deleteItemAsync(
      USER_KEY
    );
  },

  async isAuthenticated() {
    return !!(
      await this.getToken()
    );
  },
};