'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services';

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-80 lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-green-600 to-green-700">
          {/* User Profile Section */}
          {user && (
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-6">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl text-white font-bold">
                      {user.nome?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{user.nome}</h2>
                    <p className="text-green-200 text-sm">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Section */}
              <div className="mt-8 flex-1 px-4">
                <div className="mb-6">
                  <h3 className="text-green-100 text-sm font-medium mb-3">Descobrir</h3>
                  <nav className="space-y-2">
                    <Link
                      href="/dashboard"
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        pathname === '/dashboard' || pathname === '/'
                          ? 'bg-green-500 bg-opacity-30 text-white border border-green-400 border-opacity-50'
                          : 'text-green-100 hover:bg-green-500 hover:bg-opacity-20 hover:text-white'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Início
                    </Link>
                    
                    <Link
                      href="/livros"
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        pathname === '/livros'
                          ? 'bg-green-500 bg-opacity-30 text-white border border-green-400 border-opacity-50'
                          : 'text-green-100 hover:bg-green-500 hover:bg-opacity-20 hover:text-white'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Agendar
                    </Link>
                  </nav>
                </div>

                <div className="mb-6">
                  <h3 className="text-green-100 text-sm font-medium mb-3">Meus Livros</h3>
                  <nav className="space-y-2">
                    <Link
                      href="/meus-livros"
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        pathname === '/meus-livros'
                          ? 'bg-green-500 bg-opacity-30 text-white border border-green-400 border-opacity-50'
                          : 'text-green-100 hover:bg-green-500 hover:bg-opacity-20 hover:text-white'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      Livros
                    </Link>
                    
                    <Link
                      href="/ranking"
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        pathname === '/ranking'
                          ? 'bg-green-500 bg-opacity-30 text-white border border-green-400 border-opacity-50'
                          : 'text-green-100 hover:bg-green-500 hover:bg-opacity-20 hover:text-white'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      Ranking de Empréstimos
                    </Link>
                  </nav>
                </div>

                {/* Logout Button */}
                <div className="mb-6">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors text-green-100 hover:bg-red-500 hover:bg-opacity-20 hover:text-white"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sair
                  </button>
                </div>

                {/* BiblioTech Logo */}
                <div className="mt-auto mb-4">
                  <div className="flex items-center px-4 py-3 rounded-lg">
                    <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center mr-3">
                      <span className="text-white text-xs font-bold">📚</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">BIBLIO</div>
                      <div className="text-white font-semibold text-sm">TECH</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 flex z-40">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-green-600 to-green-700">
            {/* Mobile sidebar content - same as desktop */}
            {user && (
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-6">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center mr-4">
                      <span className="text-2xl text-white font-bold">
                        {user.nome?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">{user.nome}</h2>
                      <p className="text-green-200 text-sm">{user.email}</p>
                    </div>
                  </div>
                </div>
                {/* Navigation - same as desktop */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-80 flex flex-col flex-1">
        {/* Top bar for mobile only */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-16 bg-white border-b border-gray-200 px-4">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">BiblioTech</h1>
            {user && (
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 font-medium text-sm"
              >
                Sair
              </button>
            )}
          </div>
        </div>

        {/* Page content - Remove desktop header */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
