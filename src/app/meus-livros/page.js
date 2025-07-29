'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService, livrosService } from '@/services';
import Loading from '@/components/Loading';

/**
 * Página para gerenciar os livros do usuário (alugados, concluídos e atrasados)
 */
export default function MeusLivrosPage() {
  const [meusLivros, setMeusLivros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState({});
  const [filtroStatus, setFiltroStatus] = useState('alugados'); // alugados, concluidos, atrasados
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
      
      // Processar dados para adicionar campos calculados
      const livrosProcessados = livrosData.map(item => {
        const dataAtual = new Date();
        const dataDevolucao = new Date(item.data_devolucao_prevista);
        const diasRestantes = Math.ceil((dataDevolucao - dataAtual) / (1000 * 60 * 60 * 24));
        
        return {
          ...item,
          dias_restantes: diasRestantes,
          // Mapear campos para consistência
          genero: item.genero_livro || item.genero
        };
      });
      
      setMeusLivros(livrosProcessados);
    } catch (error) {
      console.error('Erro ao carregar meus livros:', error);
      // Se API falhar, usar lista vazia
      setMeusLivros([]);
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
      
      // Atualizar a lista de livros
      await loadMeusLivros();
      
      // Mostrar sucesso no modal
      setModalState(prev => ({ ...prev, step: 'success' }));
      setModalMessage('Livro marcado como concluído! Ele foi movido para a aba "Concluídos".');
      
      // Fechar modal após 3 segundos e mudar para aba concluídos
      setTimeout(() => {
        setModalState({ isOpen: false, reserva: null, step: 'confirm' });
        setModalMessage('');
        setFiltroStatus('concluidos'); // Mudar para aba concluídos
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao marcar livro como concluído:', error);
      
      // Mostrar erro no modal
      setModalState(prev => ({ ...prev, step: 'error' }));
      setModalMessage('Erro ao marcar livro como concluído. Tente novamente.');
      
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
      await loadMeusLivros();
      
    } catch (error) {
      console.error('Erro ao renovar empréstimo:', error);
    } finally {
      setIsProcessing(prev => ({ ...prev, [reservaId]: false }));
    }
  };

  const filtrarLivros = () => {
    switch (filtroStatus) {
      case 'alugados':
        return meusLivros.filter(item => 
          item.status === 'reservado' || 
          item.status === 'emprestado'
        );
      case 'concluidos':
        return meusLivros.filter(item => 
          item.status === 'concluido' || 
          item.status === 'devolvido'
        );
      case 'atrasados':
        return meusLivros.filter(item => 
          (item.status === 'reservado' || item.status === 'emprestado') && 
          item.dias_restantes < 0
        );
      default:
        return meusLivros;
    }
  };

  const livrosFiltrados = filtrarLivros();

  const getGeneroColor = (genero) => {
    if (!genero) return 'bg-gray-100 text-gray-800';
    
    const colors = {
      'Tech': 'bg-green-100 text-green-800',
      'Educacional': 'bg-purple-100 text-purple-800',
      'Didático': 'bg-blue-100 text-blue-800',
      'Literatura': 'bg-yellow-100 text-yellow-800',
      'Romance': 'bg-pink-100 text-pink-800',
      'Ação': 'bg-red-100 text-red-800',
      'Administração': 'bg-indigo-100 text-indigo-800',
      'Enfermagem': 'bg-teal-100 text-teal-800',
      'Edificações': 'bg-orange-100 text-orange-800',
      'Comédia': 'bg-lime-100 text-lime-800'
    };
    return colors[genero] || 'bg-gray-100 text-gray-800';
  };

  const calcularDiasRestantes = (dataVencimento) => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diferenca = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
    return diferenca;
  };

  const formatarData = (dataString) => {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return <Loading message="Carregando seus livros..." />;
  }

  return (
    <div className="bg-gradient-to-br from-green-600 to-green-700 min-h-screen">
      {/* Header Section */}
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Meus Livros
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-t-3xl px-6 py-8 min-h-screen">
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-8 border-b border-gray-200">
            <button
              onClick={() => setFiltroStatus('alugados')}
              className={`pb-4 text-lg font-medium transition-colors ${
                filtroStatus === 'alugados'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Alugados
            </button>
            <button
              onClick={() => setFiltroStatus('concluidos')}
              className={`pb-4 text-lg font-medium transition-colors ${
                filtroStatus === 'concluidos'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Concluídos
            </button>
            <button
              onClick={() => setFiltroStatus('atrasados')}
              className={`pb-4 text-lg font-medium transition-colors ${
                filtroStatus === 'atrasados'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Atrasados
            </button>
          </div>
        </div>

        {/* Books List */}
        {livrosFiltrados.length > 0 ? (
          <div className="space-y-4">
            {livrosFiltrados.map((item) => (
              <div key={item.id_reserva} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
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
                        {item.nome_livro}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mb-2 ${getGeneroColor(item.genero)}`}>
                        {item.genero}
                      </span>
                      <p className="text-gray-600 text-sm mb-3">
                        Autor: {item.autor_livro}
                      </p>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col items-end text-right ml-4">
                    {filtroStatus === 'alugados' && (
                      <>
                        <div className="text-right mb-4">
                          <div className="text-sm font-medium text-gray-700">Data de entrega</div>
                          <div className="text-lg font-bold text-blue-600 mb-1">
                            {formatarData(item.data_devolucao_prevista)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.dias_restantes > 0 
                              ? `${item.dias_restantes} dias restantes`
                              : item.dias_restantes === 0 
                                ? 'Vence hoje'
                                : `${Math.abs(item.dias_restantes)} dias em atraso`
                            }
                          </div>
                        </div>
                        <button
                          onClick={() => handleMarcarConcluido(item.id_reserva)}
                          disabled={isProcessing[item.id_reserva]}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                        >
                          {isProcessing[item.id_reserva] ? 'Processando...' : 'Concluir leitura'}
                        </button>
                      </>
                    )}

                    {filtroStatus === 'concluidos' && (
                      <>
                        <div className="text-right mb-4">
                          <div className="text-sm font-medium text-gray-700">Data de conclusão</div>
                          <div className="text-lg font-bold text-green-600 mb-1">
                            {formatarData(item.data_devolucao_prevista)}
                          </div>
                          <div className="text-sm text-green-600 font-medium">
                            ✅ Leitura concluída
                          </div>
                        </div>
                      </>
                    )}

                    {filtroStatus === 'atrasados' && (
                      <>
                        <div className="text-right mb-4">
                          <div className="text-sm font-medium text-gray-700">Data de entrega</div>
                          <div className="text-lg font-bold text-red-600 mb-1">
                            {formatarData(item.data_devolucao_prevista)}
                          </div>
                          <div className="text-sm text-red-600 font-medium">
                            {Math.abs(item.dias_restantes)} dias em atraso
                          </div>
                          <div className="text-xs text-red-500 mt-1">
                            Compareça à biblioteca
                          </div>
                        </div>
                        <button
                          onClick={() => handleMarcarConcluido(item.id_reserva)}
                          disabled={isProcessing[item.id_reserva]}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                        >
                          {isProcessing[item.id_reserva] ? 'Processando...' : 'Concluir leitura'}
                        </button>
                      </>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filtroStatus === 'alugados' && 'Nenhum livro alugado'}
              {filtroStatus === 'concluidos' && 'Nenhum livro concluído'}
              {filtroStatus === 'atrasados' && 'Nenhum livro em atraso'}
            </h3>
            <p className="text-gray-500">
              {filtroStatus === 'alugados' && 'Você ainda não possui livros alugados.'}
              {filtroStatus === 'concluidos' && 'Você ainda não concluiu a leitura de nenhum livro.'}
              {filtroStatus === 'atrasados' && 'Parabéns! Você não possui livros em atraso.'}
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
                      <p><span className="font-medium">Autor:</span> {modalState.reserva.autor_livro}</p>
                      <p><span className="font-medium">Data de Reserva:</span> {formatarData(modalState.reserva.data_reserva)}</p>
                      <p><span className="font-medium">Data de Entrega:</span> {formatarData(modalState.reserva.data_devolucao_prevista)}</p>
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
