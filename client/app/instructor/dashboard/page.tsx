// client/app/instructor/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Course {
  id: string;
  title: string;
  price: number;
  status: string;
  updated_at: string;
}

export default function InstructorDashboardPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([
      fetch("http://localhost:8000/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch("http://localhost:8000/courses/?limit=100", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([user, courses]) => {
        if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
          router.push("/become-instructor");
          return;
        }
        setCourses(courses);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const stats = [
    { label: "Cursos", value: courses.length, icon: "📚" },
    {
      label: "Publicados",
      value: courses.filter((c) => c.status === "PUBLISHED").length,
      icon: "✅",
    },
    { label: "Borradores", value: courses.filter((c) => c.status === "DRAFT").length, icon: "📝" },
    { label: "Valor", value: `$${courses.reduce((a, c) => a + c.price, 0)}`, icon: "💰" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf0d5] flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-[#c1121f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf0d5] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <span className="inline-block bg-[#003049] text-[#fdf0d5] px-4 py-2 rounded-full text-sm font-medium mb-3">
              👨‍🏫 Panel de Instructor
            </span>
            <h1 className="text-3xl font-bold text-[#003049]">Mis Cursos</h1>
          </div>
          <Link
            href="/instructor/create"
            className="btn-primary px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2"
          >
            <span>➕</span> Crear Curso
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-[#669bbc]/20">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-[#003049]">{s.value}</div>
              <div className="text-[#669bbc] text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        {courses.length > 0 ? (
          <div className="bg-white rounded-xl border border-[#669bbc]/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#003049] text-[#fdf0d5]">
                  <tr>
                    <th className="text-left px-6 py-4 font-medium">Curso</th>
                    <th className="text-left px-6 py-4 font-medium">Precio</th>
                    <th className="text-left px-6 py-4 font-medium">Estado</th>
                    <th className="text-left px-6 py-4 font-medium">Actualizado</th>
                    <th className="text-right px-6 py-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#669bbc]/10">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-[#fdf0d5]/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#003049]">{course.title}</div>
                      </td>
                      <td className="px-6 py-4 text-[#003049] font-medium">${course.price}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            course.status === "PUBLISHED"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {course.status === "PUBLISHED" ? "Publicado" : "Borrador"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#669bbc] text-sm">
                        {new Date(course.updated_at).toLocaleDateString("es-PE")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/instructor/manage/${course.id}`}
                            className="px-4 py-2 bg-[#003049] text-[#fdf0d5] rounded-lg text-sm font-medium hover:bg-[#001829]"
                          >
                            Editar
                          </Link>
                          <Link
                            href={`/courses/${course.id}`}
                            className="px-4 py-2 bg-[#fdf0d5] text-[#003049] rounded-lg text-sm font-medium hover:bg-[#669bbc]/20"
                          >
                            Ver
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#669bbc]/20 p-16 text-center">
            <span className="text-7xl block mb-6">📚</span>
            <h2 className="text-2xl font-bold text-[#003049] mb-2">Aún no tienes cursos</h2>
            <p className="text-[#669bbc] mb-8">Crea tu primer curso y empieza a enseñar</p>
            <Link
              href="/instructor/create"
              className="btn-primary px-8 py-4 rounded-xl font-bold inline-block"
            >
              Crear mi primer curso
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
