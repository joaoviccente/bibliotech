'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, livrosService } from '@/services';
import { useSimpleAlert } from '@/components/SimpleAlert';
import Loading from '@/components/Loading';

/**
 * Página inicial da aplicação - Dashboard principal
 */
export default function HomePage() {
  const [user, setUser] = useState(null);
  const [estatisticas, setEstatisticas] = useState({
    livrosLidos: 5,
    livrosReservados: 2,
    generoFavorito: 'Ficção Científica'
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();
  const { showError } = useSimpleAlert();

  useEffect(() => {
    const loadEstatisticas = async (currentUser) => {
      try {
        // Em uma implementação real, você faria chamadas para APIs específicas
        // Por ora, vamos simular dados baseados no usuário mock
        setEstatisticas({
          livrosLidos: currentUser?.total_livros_lidos || 5,
          livrosReservados: 2, // Seria obtido via API
          generoFavorito: currentUser?.genero_mais_lido || 'Ficção Científica'
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      }
    };

    const checkAuthAndLoadData = async () => {
      try {
        if (!authService.isAuthenticated() || !authService.isAluno()) {
          router.push('/login');
          return;
        }

        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

        // Carregar dados do dashboard
        await loadEstatisticas(currentUser);

      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showError('Erro ao carregar informações do dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router, showError]);

  if (isLoading) {
    return <Loading message="Carregando dashboard..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header de boas-vindas */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {user.nome}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Bem-vindo de volta ao BiblioTech. O que você gostaria de ler hoje?
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Livros Lidos</p>
              <p className="text-2xl font-bold text-gray-900">{estatisticas.livrosLidos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reservados</p>
              <p className="text-2xl font-bold text-gray-900">{estatisticas.livrosReservados}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gênero Favorito</p>
              <p className="text-lg font-bold text-gray-900">{estatisticas.generoFavorito}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => router.push('/livros')}
          className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Buscar Livros</p>
              <p className="text-sm text-gray-600">Encontre seu próximo livro</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push('/meus-livros')}
          className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Meus Livros</p>
              <p className="text-sm text-gray-600">Veja seus empréstimos</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push('/ranking')}
          className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-left"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Ranking</p>
              <p className="text-sm text-gray-600">Veja os top leitores</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push('/livros')}
          className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Sugestões</p>
              <p className="text-sm text-gray-600">Descubra novos livros</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
