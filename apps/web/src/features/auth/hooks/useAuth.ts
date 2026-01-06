"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { LoginDto, RegisterDto } from "@ncbs/dtos";

// ✅ Using shared DTO types for API calls
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginDto) => {
      // ✅ Type-safe: LoginDto ensures correct structure
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      return response.json();
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterDto) => {
      // ✅ Type-safe: RegisterDto ensures correct structure
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      return response.json();
    },
  });
}
