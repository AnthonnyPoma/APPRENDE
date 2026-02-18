"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  full_name: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const res = await fetch("http://localhost:8000/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setUser(await res.json());
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      }
    };

    fetchUser();

    window.addEventListener("auth-change", fetchUser);
    return () => window.removeEventListener("auth-change", fetchUser);
  }, []);



  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🎓</span>
            <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">
              APPRENDE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/courses"
              className="text-gray-600 hover:text-blue-600 font-medium transition"
            >
              Cursos
            </Link>
            {user?.role === "INSTRUCTOR" && (
              <Link
                href="/instructor/dashboard"
                className="text-gray-600 hover:text-blue-600 font-medium transition"
              >
                Dashboard
              </Link>
            )}
            <Link
              href="/become-instructor"
              className="text-gray-600 hover:text-blue-600 font-medium transition"
            >
              Enseñar
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition"
                >
                  <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user.full_name.split(" ")[0]}
                  </span>
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-blue-600 font-medium transition"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
