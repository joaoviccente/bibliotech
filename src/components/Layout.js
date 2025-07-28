'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services';

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Se for uma página que não precisa de layout, não fazer verificações
    if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/cadastrar-senha') {
      setLoading(false);
      return;
    }

    // Apenas executar no cliente
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    
    // Verificar autenticação sempre que a rota mudar
    const handleRouteChange = () => {
      if (authService.isAuthenticated()) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    };

    // Verificar novamente após um pequeno delay para garantir que o token foi salvo
    const timeoutId = setTimeout(handleRouteChange, 100);
    
    return () => clearTimeout(timeoutId);
  }, [pathname]);

  const handleLogout = async () => {
    if (typeof window === 'undefined') return;
    
    try {
      await authService.logout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Se for uma rota de admin, login ou cadastro de senha, não aplicar o layout padrão
  if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/cadastrar-senha') {
    return children;
  }

  // Não mostrar loading nas páginas que não precisam de layout
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-800">
              BiblioTech - Sistema de Leitura
            </h1>
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">
                  Olá, {user.nome}!
                </span>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      {user && (
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center space-x-8">
              <Link
                href="/dashboard"
                className="flex items-center px-3 py-4 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              >
                Home
              </Link>
              <Link
                href="/livros"
                className="flex items-center px-3 py-4 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              >
                Reservar Livros
              </Link>
              <Link
                href="/meus-livros"
                className="flex items-center px-3 py-4 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              >
                Meus Livros
              </Link>
              <Link
                href="/ranking"
                className="flex items-center px-3 py-4 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              >
                Ranking
              </Link>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
