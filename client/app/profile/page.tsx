"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
// Usamos el diseño base del Navbar, pero aquí haremos una página dedicada.

interface User {
  id: string;
  email: string;
  full_name: string;
  role: "STUDENT" | "INSTRUCTOR";
}

interface Course {
  id: string;
  title: string;
  thumbnail_url: string | null;
  slug: string;
  price: number;
  user_id?: string; // Para identificar al autor
}

interface Enrollment {
  id: string;
  course: Course;
  purchased_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"account" | "learning" | "teaching">("account");

  const API_URL = "http://localhost:8000";

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // 1. Obtener Usuario
        const userRes = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        // 2. Obtener Mis Aprendizajes (Enrollments)
        const enrollRes = await axios.get(`${API_URL}/enrollments/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEnrollments(enrollRes.data);

        // 3. Si es instructor, obtener Mis Enseñanzas (Cursos creados)
        if (userRes.data.role === "INSTRUCTOR") {
          const coursesRes = await axios.get(`${API_URL}/courses/my-courses`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMyCourses(coursesRes.data);
          // Si es instructor, por defecto mostramos "teaching" si viene de algun link específico? No, default account.
        }

      } catch (error) {
        console.error("Error cargando perfil:", error);
        // Si falla el token, logout
        if (axios.isAxiosError(error) && error.response?.status === 401) {
             localStorage.removeItem("token");
             router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-change")); // Notificar al Navbar
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Encabezado del Perfil */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl font-bold">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900">{user.full_name}</h1>
            <p className="text-gray-500">{user.email}</p>
            <div className="mt-2 flex items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-100">
                {user.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition border border-transparent hover:border-red-100"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("account")}
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
              activeTab === "account"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Mi Cuenta
          </button>
          <button
            onClick={() => setActiveTab("learning")}
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
              activeTab === "learning"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Mis Aprendizajes ({enrollments.length})
          </button>
          {user.role === "INSTRUCTOR" && (
            <button
              onClick={() => setActiveTab("teaching")}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                activeTab === "teaching"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Mis Enseñanzas ({myCourses.length})
            </button>
          )}
        </div>

        {/* Contenido de las Pestañas */}
        <div className="space-y-6">
            
          {/* TAB: MI CUENTA */}
          {activeTab === "account" && (
            <div className="bg-white rounded-2xl shadow-sm p-8 max-w-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Información Personal</h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                  <p className="mt-1 text-lg text-gray-900">{user.full_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                  <p className="mt-1 text-lg text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID de Usuario</label>
                  <p className="mt-1 text-sm font-mono text-gray-500 bg-gray-50 p-2 rounded">{user.id}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MIS APRENDIZAJES */}
          {activeTab === "learning" && (
            <div>
              {enrollments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrollments.map((enrol) => (
                    <Link key={enrol.id} href={`/courses/${enrol.course.id}`} className="group">
                      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100">
                        <div className="aspect-video bg-gray-100 relative">
                           {enrol.course.thumbnail_url ? (
                              <img 
                                src={`${API_URL}${enrol.course.thumbnail_url}`} 
                                alt={enrol.course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                              />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
                           )}
                        </div>
                        <div className="p-6">
                          <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition mb-2">
                            {enrol.course.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Comprado el: {new Date(enrol.purchased_at).toLocaleDateString()}
                          </p>
                          <div className="mt-4 w-full bg-blue-600 text-white text-center py-2 rounded-lg font-medium text-sm group-hover:bg-blue-700 transition">
                            Continuar Aprendiendo
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                  <div className="text-6xl mb-4">🎓</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Aún no te has inscrito en ningún curso</h3>
                  <p className="text-gray-500 mb-6">Explora nuestro catálogo y empieza a aprender hoy mismo.</p>
                  <Link href="/courses" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                    Explorar Cursos
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB: MIS ENSEÑANZAS (SOLO INSTRUCTORES) */}
          {activeTab === "teaching" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-gray-900">Mis Cursos Creados</h2>
                 <Link href="/instructor/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition text-sm flex items-center gap-2">
                    ➕ Crear Nuevo Curso
                 </Link>
              </div>
              
              {myCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myCourses.map((course) => (
                    <div key={course.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 flex flex-col">
                        <div className="aspect-video bg-gray-100 relative">
                           {course.thumbnail_url ? (
                              <img 
                                src={`${API_URL}${course.thumbnail_url}`} 
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
                           )}
                           <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm">
                              ${course.price}
                           </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="font-bold text-gray-900 mb-2">{course.title}</h3>
                          <div className="mt-auto pt-4 flex gap-2">
                             <Link 
                                href={`/courses/${course.id}`}
                                className="flex-1 text-center py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                             >
                                Ver
                             </Link>
                             <Link 
                                href={`/instructor/manage/${course.id}`}
                                className="flex-1 text-center py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition"
                             >
                                Gestionar
                             </Link>
                          </div>
                        </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                  <div className="text-6xl mb-4">👨‍🏫</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No has creado ningún curso todavía</h3>
                  <p className="text-gray-500 mb-6">¡Comparte tu conocimiento con el mundo!</p>
                  <Link href="/instructor/create" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                    Crear mi Primer Curso
                  </Link>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
