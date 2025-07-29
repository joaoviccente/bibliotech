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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Card Principal */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-medium text-gray-900">Login</h2>
            </div>

            {/* Seletor de Tipo de Usuário */}
            <div className="flex justify-center items-start space-x-8 mb-8">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setUserType('aluno')}
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    userType === 'aluno'
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white border-gray-300 text-gray-400 hover:border-green-300'
                  }`}
                  title="Aluno"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </button>
                <p className="text-xs text-gray-600 mt-2 font-medium text-center">Aluno</p>
              </div>
              
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setUserType('admin')}
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    userType === 'admin'
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white border-gray-300 text-gray-400 hover:border-green-300'
                  }`}
                  title="Administrador"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                </button>
                <p className="text-xs text-gray-600 mt-2 font-medium text-center">Administrador</p>
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {userType === 'aluno' ? 'MATRÍCULA' : 'USUÁRIO'}
                </label>
                <input
                  name="identifier"
                  type="text"
                  required
                  value={formData.identifier}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-200 focus:border-green-500 pr-10 text-gray-400"
                  placeholder={userType === 'aluno' ? 'Digite sua matrícula' : 'Digite seu usuário'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SENHA
                </label>
                <div className="relative">
                  <input
                    name="senha"
                    type="password"
                    required
                    value={formData.senha}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-200 focus:border-green-500 pr-10 text-gray-400"
                    placeholder="Digite sua senha"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? 'ENTRANDO...' : 'ENTRAR'}
              </button>

              {/* Mensagem de erro */}
              {errorMessage && (
                <div className="text-center">
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {errorMessage}
                  </p>
                </div>
              )}

              {/* Link para cadastro */}
              {userType === 'aluno' && (
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Não possui uma conta?{' '}
                    <a 
                      href="/cadastrar-senha" 
                      className="text-green-600 hover:text-green-500 font-medium"
                    >
                      Cadastrar
                    </a>
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Footer fixo na parte inferior */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2025 BiblioTech - Sistema de Gerenciamento de Biblioteca Escolar
          </p>
          <p className="text-xs text-gray-400 mt-1">
            EEEP - Escola Estadual de Educação Profissional
          </p>
        </div>
      </footer>
    </div>
  );
}
