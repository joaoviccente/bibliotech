import "./globals.css";
import Layout from "@/components/Layout";

export const metadata = {
  title: "BiblioTech - Sistema de Gerenciamento de Biblioteca",
  description: "Plataforma digital de gerenciamento de bibliotecas escolares para EEEPs do Ceará",
  keywords: "biblioteca, escola, livros, empréstimo, educação, EEEP, Ceará",
  authors: [{ name: "EEEP - Escola Estadual de Educação Profissional" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}
