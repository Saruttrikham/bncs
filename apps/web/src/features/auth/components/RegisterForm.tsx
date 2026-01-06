"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { RegisterDto } from "@ncbs/dtos";
import type { z } from "zod";

// ✅ Using the SAME Zod schema from shared package
const registerSchema = RegisterDto;

export function RegisterForm() {
  const [formData, setFormData] = useState<z.infer<typeof registerSchema>>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    studentId: "",
    universityId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const registerMutation = useMutation({
    mutationFn: async (data: z.infer<typeof registerSchema>) => {
      // ✅ Type-safe: data matches RegisterDto exactly
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log("Registration successful:", data);
      // Handle success
    },
    onError: (error) => {
      console.error("Registration error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validate using the SAME schema as backend
    const result = registerSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    registerMutation.mutate(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="border p-2 w-full"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password">Password (min 8 characters)</label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="border p-2 w-full"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          value={formData.firstName}
          onChange={(e) =>
            setFormData({ ...formData, firstName: e.target.value })
          }
          className="border p-2 w-full"
        />
        {errors.firstName && (
          <p className="text-red-500 text-sm">{errors.firstName}</p>
        )}
      </div>

      <div>
        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          value={formData.lastName}
          onChange={(e) =>
            setFormData({ ...formData, lastName: e.target.value })
          }
          className="border p-2 w-full"
        />
        {errors.lastName && (
          <p className="text-red-500 text-sm">{errors.lastName}</p>
        )}
      </div>

      <div>
        <label htmlFor="studentId">Student ID</label>
        <input
          id="studentId"
          value={formData.studentId}
          onChange={(e) =>
            setFormData({ ...formData, studentId: e.target.value })
          }
          className="border p-2 w-full"
        />
        {errors.studentId && (
          <p className="text-red-500 text-sm">{errors.studentId}</p>
        )}
      </div>

      <div>
        <label htmlFor="universityId">University ID</label>
        <input
          id="universityId"
          value={formData.universityId}
          onChange={(e) =>
            setFormData({ ...formData, universityId: e.target.value })
          }
          className="border p-2 w-full"
        />
        {errors.universityId && (
          <p className="text-red-500 text-sm">{errors.universityId}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={registerMutation.isPending}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        {registerMutation.isPending ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
