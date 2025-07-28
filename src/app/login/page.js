'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services';

/**
 * Página de Login para alunos e administradores
 */
export default function LoginPage() {
  const [formData, setFormData] = useState({
    identifier: '', // Matrícula para aluno ou nome para admin
    senha: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('aluno'); // 'aluno' ou 'admin'
  const [errorMessage, setErrorMessage] = useState(''); // Mensagem de erro
  
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar mensagem de erro após 3 segundos quando o usuário começar a digitar
    if (errorMessage) {
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(''); // Limpar mensagem de erro antes de tentar login

    try {
      let response;
      
      if (userType === 'aluno') {
        response = await authService.loginAluno(formData.identifier, formData.senha);
      } else {
        response = await authService.loginAdmin(formData.identifier, formData.senha);
      }

      // Redirecionar baseado no tipo de usuário (sem alert de sucesso)
      if (userType === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
      
    } catch (error) {
      console.error('Erro no login:', error);
      // Exibir mensagem de erro ao invés de alert
      setErrorMessage(
        error.response?.data?.message || 
        'Erro ao fazer login. Verifique suas credenciais.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">BiblioTech</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de Gerenciamento de Biblioteca Escolar
          </p>
        </div>

        {/* Tipo de usuário */}
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setUserType('aluno')}
            className={`flex-1 rounded-md py-2 px-4 text-sm font-medium transition-colors ${
              userType === 'aluno'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Aluno
          </button>
          <button
            type="button"
            onClick={() => setUserType('admin')}
            className={`flex-1 rounded-md py-2 px-4 text-sm font-medium transition-colors ${
              userType === 'admin'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Administrador
          </button>
        </div>

        {/* Formulário */}
        <form className="mt-8 space-y-6 bg-white p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                {userType === 'aluno' ? 'Matrícula' : 'Nome de usuário'}
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                value={formData.identifier}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-700 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={userType === 'aluno' ? 'Digite sua matrícula' : 'Digite seu nome de usuário'}
              />
            </div>
            
            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                autoComplete="current-password"
                required
                value={formData.senha}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-700 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Digite sua senha"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </div>

          {/* Mensagem de erro */}
          {errorMessage && (
            <div className="text-center">
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Links adicionais */}
          {userType === 'aluno' && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Primeira vez no sistema?{' '}
                <a 
                  href="/cadastrar-senha" 
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Cadastre sua senha
                </a>
              </p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>&copy; 2025 EEEP - Escola Estadual de Educação Profissional</p>
          <p className="mt-1">Sistema desenvolvido para otimizar o gerenciamento da biblioteca</p>
        </div>
      </div>
    </div>
  );
}
