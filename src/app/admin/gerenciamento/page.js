'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import authService from '../../../services/auth.service';
import Loading from '@/components/Loading';

/**
 * Página de Gerenciamento de Livros Reservados
 */
export default function AdminGerenciamento() {
  const [user, setUser] = useState(null);
  const [livrosReservados, setLivrosReservados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState({});
  const [modalState, setModalState] = useState({ isOpen: false, step: 'confirm' });
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [modalMessage, setModalMessage] = useState('');
  
  const router = useRouter();

  const loadLivrosReservados = useCallback(async () => {
    try {
      const token = localStorage.getItem('bibliotech_token');
      console.log('🎫 Token:', token ? 'presente' : 'ausente');
      
      const response = await fetch('http://localhost:3001/api/admin/reservas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🚫 Erro na resposta:', errorText);
        throw new Error('Erro ao carregar reservas');
      }

      const data = await response.json();
      setLivrosReservados(data);
    } catch (error) {
      console.error('❌ Erro ao carregar livros reservados:', error);
      setModalState({ isOpen: true, step: 'error' });
      setModalMessage('Erro ao carregar livros reservados');
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!authService.isAuthenticated() || !authService.isAdmin()) {
          router.push('/login');
          return;
        }

        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        
        await loadLivrosReservados();
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, loadLivrosReservados]);

  const handleLivroDevolvido = async (reserva) => {
    setSelectedReserva(reserva);
    setModalState({ isOpen: true, step: 'confirm' });
  };

  const confirmarDevolucao = async () => {
    if (!selectedReserva) return;

    setIsProcessing(prev => ({ ...prev, [selectedReserva.id]: true }));
    setModalState({ isOpen: true, step: 'processing' });

    try {
      const response = await fetch(`http://localhost:3001/api/admin/devolver/${selectedReserva.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('bibliotech_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao marcar livro como devolvido');
      }

      setModalState({ isOpen: true, step: 'success' });
      setModalMessage('Livro Devolvido!');
      await loadLivrosReservados();

      // Auto fechar após 2 segundos
      setTimeout(() => {
        setModalState({ isOpen: false, step: 'confirm' });
        setSelectedReserva(null);
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao marcar livro como devolvido:', error);
      setModalState({ isOpen: true, step: 'error' });
      setModalMessage('Erro ao marcar livro como devolvido');
    } finally {
      setIsProcessing(prev => ({ ...prev, [selectedReserva.id]: false }));
    }
  };

  if (isLoading) {
    return <Loading message="Carregando gerenciamento..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Livros Reservados
            </h2>
            <p className="text-gray-600">
              Gerencie as devoluções dos livros emprestados aos alunos
            </p>
          </div>
          
        </div>
      </div>

        {/* Lista de Livros Reservados */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          {livrosReservados.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum livro reservado
              </h3>
              <p className="text-gray-600">
                Não há livros aguardando devolução no momento.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Livro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aluno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Curso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Reserva
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {livrosReservados.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.livro_nome}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.livro_autor}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.aluno_nome}
                        </div>
                        <div className="text-sm text-gray-500">
                          Mat: {item.aluno_matricula}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.aluno_curso}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.data_reserva).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleLivroDevolvido(item)}
                          disabled={isProcessing[item.id]}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed"
                        >
                          {isProcessing[item.id] ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processando...
                            </div>
                          ) : (
                            'Devolver Livro'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* Modal de Confirmação */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-md" onClick={() => {
            if (modalState.step === 'confirm' || modalState.step === 'error') {
              setModalState({ isOpen: false, step: 'confirm' });
              setSelectedReserva(null);
            }
          }}></div>
          
          <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md mx-4 p-6">
            {modalState.step === 'confirm' && selectedReserva && (
              <>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Confirmar Devolução
                  </h3>
                  <div className="text-gray-600 mb-6 space-y-2">
                    <p><strong>Livro:</strong> {selectedReserva.livro_nome}</p>
                    <p><strong>Aluno:</strong> {selectedReserva.aluno_nome}</p>
                    <p><strong>Matrícula:</strong> {selectedReserva.aluno_matricula}</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setModalState({ isOpen: false, step: 'confirm' });
                      setSelectedReserva(null);
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarDevolucao}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Confirmar Devolução
                  </button>
                </div>
              </>
            )}

            {modalState.step === 'processing' && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Processando devolução...</p>
              </div>
            )}

            {modalState.step === 'success' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-green-600 mb-2">
                  {modalMessage} 📚
                </h3>
                <p className="text-gray-600 text-sm">
                  A devolução foi registrada com sucesso
                </p>
              </div>
            )}

            {modalState.step === 'error' && (
              <>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-red-600 mb-2">
                    Erro na Devolução
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {modalMessage}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setModalState({ isOpen: false, step: 'confirm' });
                    setSelectedReserva(null);
                  }}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Fechar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
