// MỤC ĐÍCH:
// Service đăng nhập, đăng ký và lấy user hiện tại.
// Backend FastAPI dùng OAuth2PasswordRequestForm nên login phải gửi FormData:
// username = email
// password = password

import { api, axiosInstance, User } from "./api";

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: "student" | "teacher" | "admin";
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const formData = new FormData();

    formData.append("username", email);
    formData.append("password", password);

    const res = await axiosInstance.post<LoginResponse>(
      "/auth/login",
      formData,
    );

    const data = res.data;

    localStorage.setItem("access_token", data.access_token);

    localStorage.setItem("role", data.role);

    return data;
  },

  register: (data: {
    full_name: string;
    email: string;
    password: string;
    role: "student" | "teacher" | "admin";
  }) => api.post<User>("/auth/register", data),

  me: () => api.get<User>("/auth/me"),

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  },
};
