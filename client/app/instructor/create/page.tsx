// client/app/instructor/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    price: 0,
    level: "Principiante",
    category_id: null as number | null,
    thumbnail_url: "",
  });

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:8000/categories/");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await axios.post("http://localhost:8000/files/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData({ ...formData, thumbnail_url: res.data.url });
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error al subir la imagen");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Debes iniciar sesión como instructor");
      router.push("/login");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8000/courses/", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("¡Curso creado con éxito! 🚀");
      router.push(`/instructor/manage/${res.data.id}`);
    } catch (error) {
      console.error(error);
      alert("Error al crear el curso. Revisa los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-2 bg-purple-100 rounded-full text-purple-700 font-medium mb-4">
            🎓 Panel de Instructor
          </span>
          <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Curso</h1>
          <p className="text-gray-500 mt-2">Comparte tu conocimiento con el mundo</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título del Curso <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Master en Python 2026"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtítulo</label>
              <input
                type="text"
                placeholder="Una descripción breve y atractiva"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción Detallada
              </label>
              <textarea
                rows={4}
                placeholder="En este curso aprenderás..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 resize-none"
              />
            </div>

            {/* Category + Level + Price */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                <select
                  value={formData.category_id || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category_id: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900"
                >
                  <option value="">Seleccionar...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nivel</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900"
                >
                  <option>Principiante</option>
                  <option>Intermedio</option>
                  <option>Avanzado</option>
                  <option>Todos los niveles</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: e.target.value === "" ? 0 : parseFloat(e.target.value),
                      })
                    }
                    className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen de Portada
              </label>
                <div className="flex flex-col gap-4">
                  <div className="w-full max-w-md aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center relative">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <span className="text-4xl block mb-2">🖼️</span>
                        <span className="text-gray-400 text-sm">Previsualización (16:9)</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                       La imagen se ajustará automáticamente al formato 16:9 (youtube thumbnail style).
                       <br/>Recomendado: 1280x720px.
                    </p>
                  </div>
                </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition flex justify-center items-center ${
                  loading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creando curso...
                  </span>
                ) : (
                  "Crear Curso y Agregar Contenido"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help text */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Después de crear el curso, podrás agregar secciones y lecciones
        </p>
      </div>
    </div>
  );
}
