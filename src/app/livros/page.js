'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService, livrosService } from '@/services';
import Loading from '@/components/Loading';

/**
 * Página para buscar e reservar livros
 */
export default function LivrosPage() {
  const [livros, setLivros] = useState([]);
  const [livrosFiltrados, setLivrosFiltrados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReserving, setIsReserving] = useState({});
  const [filtros, setFiltros] = useState({
    busca: '',
    genero: 'todos',
    disponivel: true
  });
  const [user, setUser] = useState(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    livro: null,
    step: 'confirm' // 'confirm', 'success', 'error'
  });
  const [modalMessage, setModalMessage] = useState('');
  
  const router = useRouter();

  const loadLivros = useCallback(async () => {
    try {
      const livrosData = await livrosService.buscarDisponiveis();
      setLivros(livrosData);
      setLivrosFiltrados(livrosData);
    } catch (error) {
      console.error('Erro ao carregar livros:', error);
      // Em caso de erro, poderemos mostrar uma mensagem de erro local
    }
  }, []);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        if (!authService.isAuthenticated() || !authService.isAluno()) {
          router.push('/login');
          return;
        }

        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

        await loadLivros();

      } catch (error) {
        console.error('Erro ao carregar livros:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router, loadLivros]);

  const aplicarFiltros = useCallback(() => {
    let resultado = [...livros];

    // Filtro por busca (nome, autor, gênero)
    if (filtros.busca) {
      const termo = filtros.busca.toLowerCase();
      resultado = resultado.filter(livro => 
        livro.nome.toLowerCase().includes(termo) ||
        livro.autor.toLowerCase().includes(termo) ||
        livro.genero.toLowerCase().includes(termo)
      );
    }

    // Filtro por gênero
    if (filtros.genero !== 'todos') {
      resultado = resultado.filter(livro => livro.genero === filtros.genero);
    }

    // Filtro por disponibilidade
    if (filtros.disponivel) {
      resultado = resultado.filter(livro => livro.disponibilidade && livro.quantidade_disponivel > 0);
    }

    setLivrosFiltrados(resultado);
  }, [filtros, livros]);

  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  const handleReservar = async (livro) => {
    if (!user) return;
    
    // Abrir modal de confirmação
    setModalState({
      isOpen: true,
      livro: livro,
      step: 'confirm'
    });
  };

  const confirmarReserva = async () => {
    if (!modalState.livro) return;

    setIsReserving(prev => ({ ...prev, [modalState.livro.id_livro]: true }));

    try {
      await livrosService.reservar(modalState.livro.id_livro);
      
      // Atualizar a lista de livros
      await loadLivros();
      
      // Mostrar sucesso no modal
      setModalState(prev => ({ ...prev, step: 'success' }));
      setModalMessage(`Livro "${modalState.livro.nome}" reservado com sucesso!`);
      
      // Fechar modal após 3 segundos
      setTimeout(() => {
        setModalState({ isOpen: false, livro: null, step: 'confirm' });
        setModalMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao reservar livro:', error);
      
      // Mostrar erro no modal
      setModalState(prev => ({ ...prev, step: 'error' }));
      setModalMessage(
        error.response?.data?.message || 
        'Erro ao reservar livro. Tente novamente.'
      );
      
      // Fechar modal após 3 segundos
      setTimeout(() => {
        setModalState({ isOpen: false, livro: null, step: 'confirm' });
        setModalMessage('');
      }, 3000);
    } finally {
      setIsReserving(prev => ({ ...prev, [modalState.livro.id_livro]: false }));
    }
  };

  const fecharModal = () => {
    setModalState({ isOpen: false, livro: null, step: 'confirm' });
    setModalMessage('');
  };

  const generos = [...new Set(livros.map(livro => livro.genero))];

  if (isLoading) {
    return <Loading message="Carregando livros..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Buscar e Reservar Livros 📚
        </h1>
        <p className="text-gray-600 mt-1">
          Encontre o livro perfeito para sua próxima leitura
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Busca */}
          <div>
            <label htmlFor="busca" className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              id="busca"
              type="text"
              value={filtros.busca}
              onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 placeholder-gray-700 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nome, autor ou gênero..."
            />
          </div>

          {/* Gênero */}
          <div>
            <label htmlFor="genero" className="block text-sm font-medium text-gray-700 mb-2">
              Gênero
            </label>
            <select
              id="genero"
              value={filtros.genero}
              onChange={(e) => setFiltros(prev => ({ ...prev, genero: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos os gêneros</option>
              {generos.map(genero => (
                <option key={genero} value={genero}>{genero}</option>
              ))}
            </select>
          </div>

          {/* Disponibilidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtros
            </label>
            <div className="flex items-center">
              <input
                id="disponivel"
                type="checkbox"
                checked={filtros.disponivel}
                onChange={(e) => setFiltros(prev => ({ ...prev, disponivel: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="disponivel" className="ml-2 text-sm text-gray-700">
                Apenas disponíveis
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Livros Encontrados ({livrosFiltrados.length})
          </h2>
        </div>

        {livrosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {livrosFiltrados.map((livro) => (
              <div key={livro.id_livro} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                {/* Capa do livro simulada */}
                <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center text-white text-4xl mb-4">
                  📖
                </div>

                {/* Informações do livro */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {livro.nome}
                  </h3>
                  <p className="text-sm text-gray-600">por {livro.autor}</p>
                  <p className="text-xs text-gray-500">{livro.genero}</p>
                  
                  {/* Status de disponibilidade */}
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        livro.disponibilidade && livro.quantidade_disponivel > 0
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {livro.disponibilidade && livro.quantidade_disponivel > 0
                          ? `${livro.quantidade_disponivel} disponível(is)`
                          : 'Indisponível'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Botão de reserva */}
                  <div className="mt-4">
                    {livro.disponibilidade && livro.quantidade_disponivel > 0 ? (
                      <button
                        onClick={() => handleReservar(livro)}
                        disabled={isReserving[livro.id_livro]}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {isReserving[livro.id_livro] ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            Reservando...
                          </div>
                        ) : (
                          'Reservar Livro'
                        )}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-md cursor-not-allowed text-sm font-medium"
                      >
                        Indisponível
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum livro encontrado</h3>
            <p className="text-gray-500">
              Tente ajustar os filtros de busca para encontrar mais livros.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Reserva */}
      {modalState.isOpen && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 relative border border-gray-200 ring-1 ring-gray-300">
            {/* Seta de voltar */}
            <button
              onClick={fecharModal}
              className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="p-6 pt-12">
              {modalState.step === 'confirm' && modalState.livro && (
                <>
                  {/* Informações do Livro */}
                  <div className="text-center mb-4">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmar Reserva</h3>
                    <p className="text-sm text-gray-500 mb-4">Deseja realmente reservar este livro?</p>
                  </div>

                  {/* Detalhes do Livro */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">{modalState.livro.nome}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Autor:</span> {modalState.livro.autor}</p>
                      <p><span className="font-medium">Gênero:</span> {modalState.livro.genero}</p>
                      <p><span className="font-medium">Disponível:</span> {modalState.livro.quantidade_disponivel} unidade(s)</p>
                    </div>
                  </div>

                  {/* Botão de Confirmação */}
                  <button
                    onClick={confirmarReserva}
                    disabled={isReserving[modalState.livro.id_livro]}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isReserving[modalState.livro.id_livro] ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Reservando...
                      </div>
                    ) : (
                      'Confirmar Reserva'
                    )}
                  </button>
                </>
              )}

              {modalState.step === 'success' && (
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Reserva Confirmada!</h3>
                  <p className="text-gray-600">{modalMessage}</p>
                </div>
              )}

              {modalState.step === 'error' && (
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro na Reserva</h3>
                  <p className="text-gray-600">{modalMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
