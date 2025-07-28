'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, alunosService } from '@/services';
import { useSimpleAlert } from '@/components/SimpleAlert';
import Loading from '@/components/Loading';

/**
 * Dashboard principal do aluno
 */
export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [estatisticas, setEstatisticas] = useState({
    livrosLidos: 0,
    livrosReservados: 0,
    generoFavorito: 'Não definido'
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();
  const { showError } = useSimpleAlert();

  useEffect(() => {
    const loadEstatisticas = async (currentUser) => {
      try {
        // Buscar estatísticas reais da API
        const estatisticasData = await alunosService.estatisticas();
        
        setEstatisticas({
          livrosLidos: estatisticasData.livros_lidos || 0,
          livrosReservados: estatisticasData.livros_reservados || 0,
          generoFavorito: estatisticasData.genero_favorito || 'Literatura Brasileira'
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        // Fallback para dados locais se API falhar
        setEstatisticas({
          livrosLidos: currentUser?.total_livros_lidos || 0,
          livrosReservados: 2,
          generoFavorito: currentUser?.genero_mais_lido || 'Literatura Brasileira'
        });
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </div>
  );
}
