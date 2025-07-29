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
      const livrosData = await livrosService.buscarDisponiveis(filtros.disponivel);
      setLivros(livrosData);
      setLivrosFiltrados(livrosData);
    } catch (error) {
      console.error('Erro ao carregar livros:', error);
      // Em caso de erro, poderemos mostrar uma mensagem de erro local
    }
  }, [filtros.disponivel]);

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

    // O filtro por disponibilidade agora é feito na API
    // Removido daqui para evitar filtro duplo

    setLivrosFiltrados(resultado);
  }, [filtros.busca, livros]);

  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  // Recarregar livros quando o filtro de disponibilidade mudar
  useEffect(() => {
    if (user) {
      loadLivros();
    }
  }, [filtros.disponivel, loadLivros, user]);

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

  if (isLoading) {
    return <Loading message="Carregando livros..." />;
  }

  return (
    <div className="bg-gradient-to-br from-green-600 to-green-700 min-h-screen">
      {/* Header Section */}
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Buscar Livros
          </h1>
        </div>

        {/* Search Section - Improved Layout */}
        <div className="bg-white bg-opacity-30 backdrop-blur rounded-xl p-6 mb-8 border border-white border-opacity-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search Input */}
            <div>
              <label className="block text-black text-sm font-bold mb-2 bg-opacity-50 px-2 py-1 rounded">
                Pesquisar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={filtros.busca}
                  onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-gray-300 text-gray-900 placeholder-gray-500"
                  placeholder="Buscar livros por título, autor, gênero"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-black text-sm font-bold mb-2 bg-opacity-50 px-2 py-1 rounded">
                Status
              </label>
              <div className="flex items-center bg-opacity-50 rounded-lg px-4 py-3 border border-white border-opacity-30">
                <input
                  id="disponivel"
                  type="checkbox"
                  checked={filtros.disponivel}
                  onChange={(e) => setFiltros(prev => ({ ...prev, disponivel: e.target.checked }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="disponivel" className="ml-2 text-gray-500 text-sm">
                  Mostrar apenas livros disponíveis
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-t-3xl px-6 py-8 min-h-screen">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-800 font-medium">
              Foram encontrados <span className="font-semibold text-green-600">{livrosFiltrados.length}</span> livros
            </p>
          </div>
        </div>

        {livrosFiltrados.length > 0 ? (
          <div className="space-y-4">
            {livrosFiltrados.map((livro) => (
              <div key={livro.id_livro} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  {/* Book Info */}
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Book Cover */}
                    <div className="w-20 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-2xl flex-shrink-0">
                      📖
                    </div>
                    
                    {/* Book Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {livro.nome}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mb-2 ${
                        livro.genero === 'Tech' ? 'bg-green-100 text-green-800' :
                        livro.genero === 'Educacional' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {livro.genero}
                      </span>
                      <p className="text-gray-600 text-sm mb-3">
                        {livro.descricao || `O livro "${livro.nome}" é um guia prático para quem quer desenvolver sistemas sólidos e sustentáveis a longo prazo, defendendo a simplicidade, coesão, independência e clareza estrutural no desenvolvimento de software.`}
                      </p>
                    </div>
                  </div>

                  {/* Availability and Action */}
                  <div className="flex flex-col items-end text-right ml-4">
                    <div className={`text-3xl font-bold mb-1 ${
                      livro.quantidade_disponivel > 0 ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {livro.quantidade_disponivel}
                    </div>
                    <div className={`text-sm mb-4 ${
                      livro.quantidade_disponivel > 0 ? 'text-gray-500' : 'text-red-500'
                    }`}>
                      {livro.quantidade_disponivel > 0 ? 'disponíveis' : 'indisponível'}
                    </div>
                    
                    {livro.disponibilidade && livro.quantidade_disponivel > 0 ? (
                      <button
                        onClick={() => handleReservar(livro)}
                        disabled={isReserving[livro.id_livro]}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                      >
                        {isReserving[livro.id_livro] ? 'Reservando...' : 'Reservar'}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="bg-red-100 text-red-600 px-6 py-2 rounded-lg cursor-not-allowed text-sm font-medium border border-red-200"
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

