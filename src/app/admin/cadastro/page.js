'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authService from '../../../services/auth.service';
import Loading from '@/components/Loading';

/**
 * Página de Cadastro de Livros e Alunos
 */
export default function AdminCadastro() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState({ isOpen: false, step: 'confirm', type: '' });
  const [modalMessage, setModalMessage] = useState('');
  
  // Estados para cadastro de livros
  const [livroForm, setLivroForm] = useState({
    nome: '',
    autor: '',
    genero: '',
    quantidade: ''
  });
  
  // Estados para cadastro de alunos
  const [alunoForm, setAlunoForm] = useState({
    nome: '',
    matricula: '',
    curso: ''
  });
  
  const [isProcessing, setIsProcessing] = useState({ livro: false, aluno: false });
  
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

  const handleLivroInputChange = (e) => {
    const { name, value } = e.target;
    setLivroForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAlunoInputChange = (e) => {
    const { name, value } = e.target;
    setAlunoForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCadastrarLivro = () => {
    // Validação básica
    if (!livroForm.nome || !livroForm.autor || !livroForm.genero || !livroForm.quantidade) {
      setModalState({ isOpen: true, step: 'error', type: 'livro' });
      setModalMessage('Por favor, preencha todos os campos do livro');
      return;
    }

    if (parseInt(livroForm.quantidade) <= 0) {
      setModalState({ isOpen: true, step: 'error', type: 'livro' });
      setModalMessage('A quantidade deve ser maior que zero');
      return;
    }

    setModalState({ isOpen: true, step: 'confirm', type: 'livro' });
  };

  const handleCadastrarAluno = () => {
    // Validação básica
    if (!alunoForm.nome || !alunoForm.matricula || !alunoForm.curso) {
      setModalState({ isOpen: true, step: 'error', type: 'aluno' });
      setModalMessage('Por favor, preencha todos os campos do aluno');
      return;
    }

    setModalState({ isOpen: true, step: 'confirm', type: 'aluno' });
  };

  const confirmarCadastroLivro = async () => {
    setIsProcessing(prev => ({ ...prev, livro: true }));
    setModalState({ isOpen: true, step: 'processing', type: 'livro' });

    try {
      const response = await fetch('http://localhost:3001/api/admin/livros', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('bibliotech_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(livroForm)
      });

      if (!response.ok) {
        throw new Error('Erro ao cadastrar livro');
      }

      setModalState({ isOpen: true, step: 'success', type: 'livro' });
      setModalMessage('Livro Cadastrado!');
      
      // Limpar formulário
      setLivroForm({
        nome: '',
        autor: '',
        genero: '',
        quantidade: ''
      });

      // Auto fechar após 2 segundos
      setTimeout(() => {
        setModalState({ isOpen: false, step: 'confirm', type: '' });
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao cadastrar livro:', error);
      setModalState({ isOpen: true, step: 'error', type: 'livro' });
      setModalMessage('Erro ao cadastrar livro');
    } finally {
      setIsProcessing(prev => ({ ...prev, livro: false }));
    }
  };

  const confirmarCadastroAluno = async () => {
    setIsProcessing(prev => ({ ...prev, aluno: true }));
    setModalState({ isOpen: true, step: 'processing', type: 'aluno' });

    try {
      const response = await fetch('http://localhost:3001/api/admin/alunos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('bibliotech_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(alunoForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao cadastrar aluno');
      }

      setModalState({ isOpen: true, step: 'success', type: 'aluno' });
      setModalMessage('Aluno Cadastrado!');
      
      // Limpar formulário
      setAlunoForm({
        nome: '',
        matricula: '',
        curso: ''
      });

      // Auto fechar após 2 segundos
      setTimeout(() => {
        setModalState({ isOpen: false, step: 'confirm', type: '' });
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao cadastrar aluno:', error);
      setModalState({ isOpen: true, step: 'error', type: 'aluno' });
      setModalMessage(error.message || 'Erro ao cadastrar aluno');
    } finally {
      setIsProcessing(prev => ({ ...prev, aluno: false }));
    }
  };

  if (isLoading) {
    return <Loading message="Carregando página de cadastro..." />;
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
              Cadastro
            </h2>
            <p className="text-gray-600">
              Cadastre novos livros e alunos no sistema
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar ao Dashboard
          </button>
        </div>
      </div>

      {/* Cards de Cadastro */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Card - Cadastro de Livros */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold text-gray-900">Cadastrar Livro</h3>
              <p className="text-gray-600">Adicione um novo livro ao acervo</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Livro
              </label>
              <input
                type="text"
                name="nome"
                value={livroForm.nome}
                onChange={handleLivroInputChange}
                className="w-full px-3 py-2 border border-gray-300 placeholder-gray-700 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite o nome do livro"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Autor
              </label>
              <input
                type="text"
                name="autor"
                value={livroForm.autor}
                onChange={handleLivroInputChange}
                className="w-full px-3 py-2 border border-gray-300 placeholder-gray-700 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite o nome do autor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gênero
              </label>
              <select
                name="genero"
                value={livroForm.genero}
                onChange={handleLivroInputChange}
                className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" className="text-gray-700">Selecione um gênero</option>
                <option value="Romance">Romance</option>
                <option value="Ficção">Ficção</option>
                <option value="Não-ficção">Não-ficção</option>
                <option value="Biografia">Biografia</option>
                <option value="História">História</option>
                <option value="Ciência">Ciência</option>
                <option value="Tecnologia">Tecnologia</option>
                <option value="Arte">Arte</option>
                <option value="Filosofia">Filosofia</option>
                <option value="Educação">Educação</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade
              </label>
              <input
                type="number"
                name="quantidade"
                value={livroForm.quantidade}
                onChange={handleLivroInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 placeholder-gray-700 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Quantidade de exemplares"
              />
            </div>

            <button
              onClick={handleCadastrarLivro}
              disabled={isProcessing.livro}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {isProcessing.livro ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Cadastrando...
                </div>
              ) : (
                'Cadastrar Livro'
              )}
            </button>
          </div>
        </div>

        {/* Card - Cadastro de Alunos */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold text-gray-900">Cadastrar Aluno</h3>
              <p className="text-gray-600">Adicione um novo aluno ao sistema</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                name="nome"
                value={alunoForm.nome}
                onChange={handleAlunoInputChange}
                className="w-full px-3 py-2 border border-gray-300 placeholder-gray-700 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Digite o nome completo do aluno"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matrícula
              </label>
              <input
                type="text"
                name="matricula"
                value={alunoForm.matricula}
                onChange={handleAlunoInputChange}
                className="w-full px-3 py-2 border border-gray-300 placeholder-gray-700 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Digite a matrícula do aluno"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Curso
              </label>
              <select
                name="curso"
                value={alunoForm.curso}
                onChange={handleAlunoInputChange}
                className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="" className="text-gray-700">Selecione um curso</option>
                <option value="Informática">Informática</option>
                <option value="Administração">Administração</option>
                <option value="Contabilidade">Contabilidade</option>
                <option value="Enfermagem">Enfermagem</option>
                <option value="Agropecuária">Agropecuária</option>
                <option value="Edificações">Edificações</option>
                <option value="Eletrotécnica">Eletrotécnica</option>
                <option value="Mecânica">Mecânica</option>
                <option value="Química">Química</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <button
              onClick={handleCadastrarAluno}
              disabled={isProcessing.aluno}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {isProcessing.aluno ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Cadastrando...
                </div>
              ) : (
                'Cadastrar Aluno'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-md" onClick={() => {
            if (modalState.step === 'confirm' || modalState.step === 'error') {
              setModalState({ isOpen: false, step: 'confirm', type: '' });
            }
          }}></div>
          
          <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md mx-4 p-6">
            {modalState.step === 'confirm' && (
              <>
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 ${modalState.type === 'livro' ? 'bg-blue-100' : 'bg-green-100'} rounded-full flex items-center justify-center`}>
                    {modalState.type === 'livro' ? (
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Confirmar Cadastro
                  </h3>
                  <div className="text-gray-600 mb-6 space-y-2">
                    {modalState.type === 'livro' ? (
                      <>
                        <p><strong>Livro:</strong> {livroForm.nome}</p>
                        <p><strong>Autor:</strong> {livroForm.autor}</p>
                        <p><strong>Gênero:</strong> {livroForm.genero}</p>
                        <p><strong>Quantidade:</strong> {livroForm.quantidade}</p>
                      </>
                    ) : (
                      <>
                        <p><strong>Nome:</strong> {alunoForm.nome}</p>
                        <p><strong>Matrícula:</strong> {alunoForm.matricula}</p>
                        <p><strong>Curso:</strong> {alunoForm.curso}</p>
                        <p className="text-sm text-blue-600 mt-2">
                          💡 O aluno deve cadastrar sua senha posteriormente
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setModalState({ isOpen: false, step: 'confirm', type: '' });
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={modalState.type === 'livro' ? confirmarCadastroLivro : confirmarCadastroAluno}
                    className={`flex-1 px-4 py-2 ${modalState.type === 'livro' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg font-medium transition-colors`}
                  >
                    Confirmar Cadastro
                  </button>
                </div>
              </>
            )}

            {modalState.step === 'processing' && (
              <div className="text-center py-8">
                <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${modalState.type === 'livro' ? 'border-blue-600' : 'border-green-600'} mx-auto mb-4`}></div>
                <p className="text-gray-600">
                  {modalState.type === 'livro' ? 'Cadastrando livro...' : 'Cadastrando aluno...'}
                </p>
              </div>
            )}

            {modalState.step === 'success' && (
              <div className="text-center py-4">
                <div className={`w-16 h-16 mx-auto mb-4 ${modalState.type === 'livro' ? 'bg-blue-100' : 'bg-green-100'} rounded-full flex items-center justify-center`}>
                  <svg className={`w-8 h-8 ${modalState.type === 'livro' ? 'text-blue-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className={`text-lg font-semibold ${modalState.type === 'livro' ? 'text-blue-600' : 'text-green-600'} mb-2`}>
                  {modalMessage} {modalState.type === 'livro' ? '📚' : '👨‍🎓'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {modalState.type === 'livro' ? 'O livro foi adicionado ao acervo' : 'O aluno foi cadastrado e deve definir sua senha'}
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
                    Erro no Cadastro
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {modalMessage}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setModalState({ isOpen: false, step: 'confirm', type: '' });
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
