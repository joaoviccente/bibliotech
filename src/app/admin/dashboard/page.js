'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { alunosService, authService, livrosService } from '@/services';
import Loading from '@/components/Loading';

/**
 * Dashboard do Administrador
 */
export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [dataAllBooks, setDataAllBooks] = useState([]);
  const [dataAllStudents, setDataAllStudents] = useState([]);
  const [dataAllLendings, setDataAllLendings] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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

  useEffect(() => {
    const fetchDatas = async () => {
      
      try {
        const allBooks = await livrosService.buscarTodos();
        const allStudents = await alunosService.buscarTodos();
        const allLendings = await livrosService.buscarPorQtd()

        setDataAllBooks(allBooks);
        setDataAllStudents(allStudents)
        setDataAllLendings(allLendings)
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDatas();
  }, []);



  if (isLoading) {
    return <Loading message="Carregando painel administrativo..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-green-600 to-green-700 min-h-screen">
      {/* Header Section */}
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Painel de Controle
          </h1>
          <p className="text-green-100">
            Visão geral do sistema BiblioTech
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-t-3xl px-6 py-8 min-h-screen">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total de Livros */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Total de Livros</h3>
                <p className="text-3xl font-bold text-blue-600">{dataAllBooks.quantity}</p>
                <p className="text-sm text-gray-500">No sistema</p>
              </div>
            </div>
          </div>

          {/* Usuários Ativos */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Usuários Ativos</h3>
                <p className="text-3xl font-bold text-green-600">{dataAllStudents.quantity}</p>
                <p className="text-sm text-gray-500">Estudantes cadastrados</p>
              </div>
            </div>
          </div>

          {/* Empréstimos Ativos */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Empréstimos</h3>
                <p className="text-3xl font-bold text-yellow-600">{dataAllLendings.totalEmprestados}</p>
                <p className="text-sm text-gray-500">Em andamento</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
