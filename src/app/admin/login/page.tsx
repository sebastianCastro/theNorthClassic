"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Credenciales incorrectas");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg border border-border bg-surface p-8"
      >
        <h1 className="heading-display text-3xl text-white">Acceso admin</h1>
        <p className="mt-2 text-sm text-muted">The North Classic CMS</p>

        <div className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="text-xs uppercase text-muted">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-xs uppercase text-muted">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded border border-border bg-black px-3 py-2 text-white"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-8 w-full disabled:opacity-50"
        >
          {loading ? "Entrando…" : "Iniciar sesión"}
        </button>
      </form>
    </div>
  );
}
