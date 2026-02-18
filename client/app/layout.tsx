import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "APPRENDE - Aprende de los Mejores Expertos",
  description: "Plataforma de cursos online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        
        <footer className="bg-white border-t border-gray-200 py-12">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
               <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🎓</span>
                  <span className="text-xl font-bold text-gray-900">APPRENDE</span>
               </div>
               <p className="text-gray-500 max-w-sm">
                 La plataforma educativa diseñada para conectar expertos con estudiantes ávidos de conocimiento.
               </p>
            </div>
            <div>
               <h4 className="font-bold text-gray-900 mb-4">Plataforma</h4>
               <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link href="/courses" className="hover:text-blue-600">Explorar Cursos</Link></li>
                  <li><Link href="/become-instructor" className="hover:text-blue-600">Enseñar</Link></li>
                  <li><Link href="/login" className="hover:text-blue-600">Iniciar Sesión</Link></li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
               <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link href="#" className="hover:text-blue-600">Términos</Link></li>
                  <li><Link href="#" className="hover:text-blue-600">Privacidad</Link></li>
               </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
             © {new Date().getFullYear()} APPRENDE. Todos los derechos reservados.
          </div>
        </footer>
      </body>
    </html>
  );
}
