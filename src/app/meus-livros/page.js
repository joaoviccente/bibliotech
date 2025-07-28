'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService, livrosService } from '@/services';
import Loading from '@/components/Loading';

/**
 * Página para gerenciar os livros do usuário (reservados e concluídos)
 */
export default function MeusLivrosPage() {
  const [meusLivros, setMeusLivros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState({});
  const [filtroStatus, setFiltroStatus] = useState('todos'); // todos, reservado, concluido, atrasado
  const [user, setUser] = useState(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    reserva: null,
    step: 'confirm' // 'confirm', 'success', 'error'
  });
  const [modalMessage, setModalMessage] = useState('');
  
  const router = useRouter();

  const loadMeusLivros = useCallback(async () => {
    try {
      const livrosData = await livrosService.meuHistorico();
      setMeusLivros(livrosData);
    } catch (error) {
      console.error('Erro ao carregar meus livros:', error);
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

        await loadMeusLivros();

      } catch (error) {
        console.error('Erro ao carregar meus livros:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router, loadMeusLivros]);

  const handleMarcarConcluido = async (reservaId) => {
    const reserva = meusLivros.find(item => item.id_reserva === reservaId);
    if (!reserva) return;
    
    // Abrir modal de confirmação
    setModalState({
      isOpen: true,
      reserva: reserva,
      step: 'confirm'
    });
  };

  const confirmarConclusao = async () => {
    if (!modalState.reserva) return;

    setIsProcessing(prev => ({ ...prev, [modalState.reserva.id_reserva]: true }));

    try {
      await livrosService.marcarConcluido(modalState.reserva.id_reserva);
      await loadMeusLivros();
      
      // Mostrar sucesso no modal
      setModalState(prev => ({ ...prev, step: 'success' }));
      setModalMessage('Livro Concluído!');
      
      // Fechar modal após 3 segundos
      setTimeout(() => {
        setModalState({ isOpen: false, reserva: null, step: 'confirm' });
        setModalMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao marcar livro como concluído:', error);
      
      // Mostrar erro no modal
      setModalState(prev => ({ ...prev, step: 'error' }));
      setModalMessage('Erro ao marcar livro como concluído');
      
      // Fechar modal após 3 segundos
      setTimeout(() => {
        setModalState({ isOpen: false, reserva: null, step: 'confirm' });
        setModalMessage('');
      }, 3000);
    } finally {
      setIsProcessing(prev => ({ ...prev, [modalState.reserva.id_reserva]: false }));
    }
  };

  const fecharModal = () => {
    setModalState({ isOpen: false, reserva: null, step: 'confirm' });
    setModalMessage('');
  };

  const handleRenovar = async (reservaId) => {
    setIsProcessing(prev => ({ ...prev, [reservaId]: true }));

    try {
      await livrosService.renovarEmprestimo(reservaId);
      // Poderemos implementar um modal para renovação também se necessário
      await loadMeusLivros();
      
    } catch (error) {
      console.error('Erro ao renovar empréstimo:', error);
      // Em caso de erro, poderemos mostrar uma mensagem de erro local
    } finally {
      setIsProcessing(prev => ({ ...prev, [reservaId]: false }));
    }
  };

  const filtrarLivros = () => {
    if (filtroStatus === 'todos') return meusLivros;
    return meusLivros.filter(item => item.status === filtroStatus);
  };

  const livrosFiltrados = filtrarLivros();

  const getStatusColor = (status) => {
    switch (status) {
      case 'reservado':
        return 'bg-blue-100 text-blue-800';
      case 'emprestado':
        return 'bg-green-100 text-green-800';
      case 'concluido':
        return 'bg-purple-100 text-purple-800';
      case 'atrasado':
        return 'bg-red-100 text-red-800';
      case 'devolvido':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'reservado':
        return 'Reservado';
      case 'emprestado':
        return 'Emprestado';
      case 'concluido':
        return 'Concluído';
      case 'atrasado':
        return 'Em Atraso';
      case 'devolvido':
        return 'Devolvido';
      default:
        return status;
    }
  };

  const calcularDiasRestantes = (dataVencimento) => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diferenca = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
    return diferenca;
  };

  if (isLoading) {
    return <Loading message="Carregando seus livros..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Meus Livros 📚
        </h1>
        <p className="text-gray-600 mt-1">
          Gerencie seus livros reservados e concluídos
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroStatus('todos')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filtroStatus === 'todos'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({meusLivros.length})
          </button>
          <button
            onClick={() => setFiltroStatus('reservado')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filtroStatus === 'reservado'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Reservados ({meusLivros.filter(l => l.status === 'reservado').length})
          </button>
          <button
            onClick={() => setFiltroStatus('concluido')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filtroStatus === 'concluido'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Concluídos ({meusLivros.filter(l => l.status === 'concluido').length})
          </button>
          <button
            onClick={() => setFiltroStatus('atrasado')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filtroStatus === 'atrasado'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Em Atraso ({meusLivros.filter(l => l.status === 'atrasado').length})
          </button>
        </div>
      </div>

      {/* Lista de livros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {livrosFiltrados.length > 0 ? (
          <div className="space-y-6">
            {livrosFiltrados.map((item) => (
              <div key={item.id_reserva} className="border border-gray-200 rounded-lg p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Informações do livro */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.nome_livro}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">por {item.autor_livro}</p>
                        
                        {/* Status */}
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      </div>
                      
                      {/* Capa simulada */}
                      <div className="w-16 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-xl ml-4 lg:hidden">
                        📖
                      </div>
                    </div>

                    {/* Datas e informações */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      {item.data_reserva && (
                        <div>
                          <span className="font-medium text-gray-700">Data da Reserva:</span>
                          <p className="text-gray-600">{new Date(item.data_reserva).toLocaleDateString('pt-BR')}</p>
                        </div>
                      )}
                      
                      {item.data_emprestimo && (
                        <div>
                          <span className="font-medium text-gray-700">Data do Empréstimo:</span>
                          <p className="text-gray-600">{new Date(item.data_emprestimo).toLocaleDateString('pt-BR')}</p>
                        </div>
                      )}
                      
                      {item.data_vencimento && (
                        <div>
                          <span className="font-medium text-gray-700">Data de Vencimento:</span>
                          <p className={`${
                            calcularDiasRestantes(item.data_vencimento) < 0 
                              ? 'text-red-600 font-medium' 
                              : calcularDiasRestantes(item.data_vencimento) <= 3
                              ? 'text-yellow-600 font-medium'
                              : 'text-gray-600'
                          }`}>
                            {new Date(item.data_vencimento).toLocaleDateString('pt-BR')}
                            {item.status === 'emprestado' && (
                              <span className="block text-xs">
                                {calcularDiasRestantes(item.data_vencimento) < 0 
                                  ? `${Math.abs(calcularDiasRestantes(item.data_vencimento))} dias em atraso`
                                  : `${calcularDiasRestantes(item.data_vencimento)} dias restantes`
                                }
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                      
                      {item.data_devolucao && (
                        <div>
                          <span className="font-medium text-gray-700">Data da Devolução:</span>
                          <p className="text-gray-600">{new Date(item.data_devolucao).toLocaleDateString('pt-BR')}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Capa do livro (desktop) */}
                  <div className="hidden lg:block w-16 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex-shrink-0 ml-6 flex items-center justify-center text-white text-xl">
                    📖
                  </div>
                </div>

                {/* Ações */}
                <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-200">
                  {item.status === 'reservado' && (
                    <button
                      onClick={() => handleMarcarConcluido(item.id_reserva)}
                      disabled={isProcessing[item.id_reserva]}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {isProcessing[item.id_reserva] ? 'Processando...' : 'Marcar como Concluído'}
                    </button>
                  )}
                  
                  {item.status === 'emprestado' && (
                    <button
                      onClick={() => handleRenovar(item.id_reserva)}
                      disabled={isProcessing[item.id_reserva]}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {isProcessing[item.id_reserva] ? 'Renovando...' : 'Renovar Empréstimo'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filtroStatus === 'todos' ? 'Nenhum livro encontrado' : `Nenhum livro ${getStatusText(filtroStatus).toLowerCase()}`}
            </h3>
            <p className="text-gray-500">
              {filtroStatus === 'todos' 
                ? 'Você ainda não possui livros reservados ou concluídos.'
                : 'Experimente outros filtros para ver mais livros.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Conclusão */}
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
              {modalState.step === 'confirm' && modalState.reserva && (
                <>
                  {/* Informações do Livro */}
                  <div className="text-center mb-4">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Marcar como Concluído</h3>
                    <p className="text-sm text-gray-500 mb-4">Confirma que você terminou a leitura deste livro?</p>
                  </div>

                  {/* Detalhes do Livro */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">{modalState.reserva.nome_livro}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Autor:</span> {modalState.reserva.autor}</p>
                      <p><span className="font-medium">Data de Reserva:</span> {new Date(modalState.reserva.data_reserva).toLocaleDateString('pt-BR')}</p>
                      {modalState.reserva.data_devolucao_prevista && (
                        <p><span className="font-medium">Devolução Prevista:</span> {new Date(modalState.reserva.data_devolucao_prevista).toLocaleDateString('pt-BR')}</p>
                      )}
                    </div>
                  </div>

                  {/* Botão de Confirmação */}
                  <button
                    onClick={confirmarConclusao}
                    disabled={isProcessing[modalState.reserva.id_reserva]}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isProcessing[modalState.reserva.id_reserva] ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Processando...
                      </div>
                    ) : (
                      'Confirmar Conclusão'
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Livro Concluído!</h3>
                  <p className="text-gray-600">Parabéns por concluir mais uma leitura! 🎉</p>
                </div>
              )}

              {modalState.step === 'error' && (
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro na Operação</h3>
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
