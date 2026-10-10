import { api } from "./api";
import type { User } from "../types/auth";

export async function signup(data: {
  name: string;
  email: string;
  password: string;
}) {
  const response = await api.post<{ user: User }>(
    "/auth/signup",
    data
  );

  return response.data.user;
}

export async function signin(data: {
  email: string;
  password: string;
}) {
  const response = await api.post<{ user: User }>(
    "/auth/signin",
    data
  );

  return response.data.user;
}

export async function signout() {
  await api.post("/auth/signout");
}

export async function getCurrentUser() {
  const response = await api.get<{ user: User }>(
    "/auth/me"
  );

  return response.data.user;
}