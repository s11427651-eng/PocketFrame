"use client";

import { useSyncExternalStore } from "react";
import { newId } from "./types";

export type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string;
};

const KEY = "pf:users";

let users: User[] = [];
const listeners = new Set<() => void>();

function load(): User[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function persist() {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(users));
  listeners.forEach((l) => l());
}

export function useUsers(): User[] {
  return useSyncExternalStore(subscribe, read, () => []);
}

function read(): User[] {
  if (!users.length && typeof window !== "undefined") {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      try {
        users = JSON.parse(raw);
      } catch {
        users = [];
      }
    }
  }
  return users;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export type AuthResult = { ok: boolean; user?: User; error?: string };

export function register(data: { name: string; email: string; username: string; password: string; confirm: string }): AuthResult {
  users = load();
  const name = data.name.trim();
  const email = data.email.trim().toLowerCase();
  const username = data.username.trim();
  const password = data.password;

  if (!name) return { ok: false, error: "Please enter your name." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "Enter a valid email address." };
  if (username.length < 3) return { ok: false, error: "ID must be at least 3 characters." };
  if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
  if (password !== data.confirm) return { ok: false, error: "Passwords do not match." };
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase()))
    return { ok: false, error: "That ID is already taken." };
  if (users.some((u) => u.email === email)) return { ok: false, error: "That email is already registered." };

  const user: User = { id: newId(), name, email, username, password };
  users = [...users, user];
  persist();
  return { ok: true, user };
}

export function login(username: string, password: string): AuthResult {
  users = load();
  const u = users.find((x) => x.username.toLowerCase() === username.trim().toLowerCase());
  if (!u || u.password !== password) {
    return { ok: false, error: "The username or password is wrong. Please try again." };
  }
  return { ok: true, user: u };
}
