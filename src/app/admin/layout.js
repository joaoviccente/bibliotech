'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services';

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!authService.isAuthenticated() || !authService.isAdmin()) {
          router.push('/login');
          return;
        }

        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-80 lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-green-600 to-green-700">
          {/* User Profile Section */}
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-6">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl text-white font-bold">
                    {user.nome?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{user.nome}</h2>
                  <p className="text-green-200 text-sm">Administrador</p>
                </div>
              </div>
            </div>

            {/* Navigation Section */}
            <div className="mt-8 flex-1 px-4">
              <div className="mb-6">
                <h3 className="text-green-100 text-sm font-medium mb-3">Painel Administrativo</h3>
                <nav className="space-y-2">
                  <Link
                    href="/admin/dashboard"
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      pathname === '/admin/dashboard'
                        ? 'bg-green-500 bg-opacity-30 text-white border border-green-400 border-opacity-50'
                        : 'text-green-100 hover:bg-green-500 hover:bg-opacity-20 hover:text-white'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Dashboard
                  </Link>
                  
                  <Link
                    href="/admin/cadastro"
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      pathname === '/admin/cadastro'
                        ? 'bg-green-500 bg-opacity-30 text-white border border-green-400 border-opacity-50'
                        : 'text-green-100 hover:bg-green-500 hover:bg-opacity-20 hover:text-white'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Cadastro
                  </Link>
                </nav>
              </div>

              <div className="mb-6">
                <h3 className="text-green-100 text-sm font-medium mb-3">Gerenciamento</h3>
                <nav className="space-y-2">
                  <Link
                    href="/admin/gerenciamento"
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      pathname === '/admin/gerenciamento'
                        ? 'bg-green-500 bg-opacity-30 text-white border border-green-400 border-opacity-50'
                        : 'text-green-100 hover:bg-green-500 hover:bg-opacity-20 hover:text-white'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Livros e Usuários
                  </Link>
                  
                  <Link
                    href="/admin/relatorios"
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      pathname === '/admin/relatorios'
                        ? 'bg-green-500 bg-opacity-30 text-white border border-green-400 border-opacity-50'
                        : 'text-green-100 hover:bg-green-500 hover:bg-opacity-20 hover:text-white'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Relatórios
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
                    <span className="text-white text-xs font-bold">📖</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">BIBLIO</div>
                    <div className="text-white font-semibold text-sm">TECH</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 flex z-40">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-green-600 to-green-700">
            {/* Mobile sidebar content - same as desktop */}
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-6">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl text-white font-bold">
                      {user.nome?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{user.nome}</h2>
                    <p className="text-green-200 text-sm">Administrador</p>
                  </div>
                </div>
              </div>
              {/* Navigation - same as desktop */}
            </div>
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
            <h1 className="text-lg font-semibold text-gray-900">BiblioTech - Admin</h1>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 font-medium text-sm"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
