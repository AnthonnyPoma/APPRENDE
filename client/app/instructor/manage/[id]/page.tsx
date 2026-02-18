// client/app/instructor/manage/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

// --- Tipos de datos ---
interface Lesson {
  id: string;
  title: string;
  lesson_type: "video" | "pdf" | "image" | "quiz";
  is_free_preview: boolean;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  thumbnail_url?: string;
  sections: Section[];
}

export default function ManageCoursePage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados para formularios
  const [newSectionTitle, setNewSectionTitle] = useState("");

  // Estado para crear lección
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [newLessonData, setNewLessonData] = useState({
    title: "",
    type: "video", // Valor por defecto
    url: "",
  });

  // Estado para subida de archivo
  const [uploading, setUploading] = useState(false);

  // 1. Cargar datos del curso
  const fetchCourseData = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/courses/${params.id}`);
      setCourse(res.data);
    } catch (error) {
      console.error("Error cargando curso", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) fetchCourseData();
  }, [params.id]);

  // 2. Crear SECCIÓN
  const handleCreateSection = async () => {
    if (!newSectionTitle.trim()) return;
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `http://localhost:8000/courses/${params.id}/sections`,
        { title: newSectionTitle, order_index: course?.sections.length || 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewSectionTitle("");
      fetchCourseData();
    } catch (error) {
      alert("Error al crear sección");
    }
  };

  // 3. Crear LECCIÓN
  const handleCreateLesson = async (sectionId: string) => {
    if (!newLessonData.title || !newLessonData.url) {
      alert("Completa el título y sube un archivo (o pon URL)");
      return;
    }
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `http://localhost:8000/courses/${sectionId}/lessons`,
        {
          title: newLessonData.title,
          video_resource_id: newLessonData.url,
          lesson_type: newLessonData.type,
          is_free_preview: false,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNewLessonData({ title: "", type: "video", url: "" });
      setActiveSectionId(null);
      fetchCourseData();
    } catch (error) {
      console.error(error);
      alert("Error al crear lección");
    }
  };

  // 4. Subir ARCHIVO 📤
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:8000/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Guardamos la URL que devolvió el backend
      setNewLessonData({ ...newLessonData, url: "http://localhost:8000" + res.data.url });
      alert("¡Archivo subido correctamente!");
    } catch (error) {
      console.error("Error subiendo archivo", error);
      alert("Error al subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Cargando Gestor... 🔨</div>;
  if (!course) return <div className="p-10 text-center">Curso no encontrado</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-500">Gestor de Contenido</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/courses/${course.id}`)}
              className="text-gray-600 hover:text-blue-600 font-medium text-sm transition flex items-center gap-2"
            >
              👁️ Ver como estudiante
            </button>
            <button
              onClick={() => router.push("/instructor/dashboard")}
              className="bg-green-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-green-700 transition shadow-sm text-sm flex items-center gap-2"
            >
              ✅ Finalizar
            </button>
          </div>
        </div>

        {/* ÁREA DE SECCIONES */}
        <div className="space-y-6">
          {course.sections.map((section, index) => (
            <div
              key={section.id}
              className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden"
            >
              <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">
                  Módulo {index + 1}: {section.title}
                </h3>
              </div>

              <div className="p-6">
                {/* Lista de Lecciones */}
                {section.lessons.length > 0 ? (
                  <ul className="space-y-3 mb-6">
                    {section.lessons.map((lesson) => (
                      <li
                        key={lesson.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-100"
                      >
                        <span className="text-xl">
                          {lesson.lesson_type === "video" && "🎥"}
                          {lesson.lesson_type === "pdf" && "📄"}
                          {lesson.lesson_type === "image" && "🖼️"}
                          {lesson.lesson_type === "quiz" && "📝"}
                        </span>
                        <span className="font-medium text-gray-700">{lesson.title}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic mb-4">
                    No hay lecciones en este módulo.
                  </p>
                )}

                {/* Formulario Agregar Lección */}
                {activeSectionId === section.id ? (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="font-bold text-blue-800 text-sm mb-3">Nueva Lección</h4>

                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Título de la clase"
                        className="w-full p-2 border rounded"
                        value={newLessonData.title}
                        onChange={(e) =>
                          setNewLessonData({ ...newLessonData, title: e.target.value })
                        }
                      />

                      <div className="flex flex-col md:flex-row gap-2">
                        <select
                          className="p-2 border rounded"
                          value={newLessonData.type}
                          onChange={(e) =>
                            setNewLessonData({ ...newLessonData, type: e.target.value })
                          }
                        >
                          <option value="video">Video</option>
                          <option value="pdf">Documento PDF</option>
                          <option value="image">Imagen</option>
                        </select>

                        <div className="flex-1 flex flex-col gap-2">
                          {/* Input de Archivo */}
                          <input
                            type="file"
                            onChange={handleFileUpload}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />

                          {uploading && (
                            <p className="text-sm text-blue-600">Subiendo archivo... ⏳</p>
                          )}

                          {/* URL Generada (Solo lectura) */}
                          <input
                            type="text"
                            placeholder="La URL se generará automáticamente..."
                            className="w-full p-2 border rounded bg-gray-100 text-gray-500 text-xs"
                            value={newLessonData.url}
                            readOnly
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleCreateLesson(section.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                          disabled={uploading}
                        >
                          Guardar Lección
                        </button>
                        <button
                          onClick={() => setActiveSectionId(null)}
                          className="text-gray-500 px-4 py-2 text-sm hover:text-gray-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveSectionId(section.id)}
                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition"
                  >
                    + Agregar Contenido
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Formulario Nueva Sección */}
          <div className="bg-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300 flex items-center gap-4">
            <input
              type="text"
              placeholder="Nombre del Nuevo Módulo..."
              className="flex-1 p-3 border border-gray-300 rounded shadow-sm"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
            />
            <button
              onClick={handleCreateSection}
              className="bg-gray-900 text-white px-6 py-3 rounded font-bold hover:bg-black transition shadow-lg"
            >
              Crear Módulo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
