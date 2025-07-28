'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { alunosService } from '@/services';

/**
 * Página para cadastro de senha do aluno
 */
export default function CadastrarSenhaPage() {
  const [formData, setFormData] = useState({
    matricula: '',
    senha: '',
    confirmarSenha: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: verificar matrícula, 2: cadastrar senha
  const [alunoData, setAlunoData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar mensagens após 3 segundos quando o usuário digitar
    if (errorMessage) {
      setTimeout(() => setErrorMessage(''), 3000);
    }
    if (successMessage) {
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleVerificarMatricula = async (e) => {
    e.preventDefault();
    
    if (!formData.matricula.trim()) {
      setErrorMessage('Por favor, digite sua matrícula.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const aluno = await alunosService.buscarPorMatricula(formData.matricula);
      
      if (aluno.senha) {
        setErrorMessage('Esta matrícula já possui senha cadastrada. Use a tela de login.');
        return;
      }
      
      setAlunoData(aluno);
      setStep(2);
      setSuccessMessage('Matrícula encontrada! Agora você pode cadastrar sua senha.');
      
    } catch (error) {
      console.error('Erro ao verificar matrícula:', error);
      setErrorMessage(
        error.response?.data?.message || 
        'Matrícula não encontrada. Verifique se digitou corretamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCadastrarSenha = async (e) => {
    e.preventDefault();
    
    // Validações
    if (!formData.senha.trim()) {
      setErrorMessage('Por favor, digite uma senha.');
      return;
    }

    if (formData.senha.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await alunosService.cadastrarSenha(formData.matricula, formData.senha, formData.confirmarSenha);
      
      setSuccessMessage('Senha cadastrada com sucesso! Redirecionando para o login...');
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao cadastrar senha:', error);
      setErrorMessage(
        error.response?.data?.message || 
        'Erro ao cadastrar senha. Tente novamente.'
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
          <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Cadastrar Senha</h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1 
              ? 'Digite sua matrícula para verificação' 
              : 'Crie uma senha para acessar o sistema'
            }
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className={`h-1 w-8 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
        </div>

        {/* Step 1: Verificar Matrícula */}
        {step === 1 && (
          <form className="mt-8 space-y-6 bg-white p-6 rounded-lg shadow-md" onSubmit={handleVerificarMatricula}>
            <div>
              <label htmlFor="matricula" className="block text-sm font-medium text-gray-700">
                Matrícula
              </label>
              <input
                id="matricula"
                name="matricula"
                type="text"
                required
                value={formData.matricula}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-700 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Digite sua matrícula"
              />
              <p className="mt-2 text-xs text-gray-500">
                Digite a matrícula que foi fornecida pela escola
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Verificando...
                </div>
              ) : (
                'Verificar Matrícula'
              )}
            </button>

            {/* Mensagens */}
            {errorMessage && (
              <div className="text-center">
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {errorMessage}
                </p>
              </div>
            )}
            
            {successMessage && (
              <div className="text-center">
                <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                  {successMessage}
                </p>
              </div>
            )}
          </form>
        )}

        {/* Step 2: Cadastrar Senha */}
        {step === 2 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            {/* Dados do aluno */}
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Dados confirmados:</h3>
              <p className="text-sm text-gray-600">Nome: {alunoData?.nome}</p>
              <p className="text-sm text-gray-600">Curso: {alunoData?.curso}</p>
              <p className="text-sm text-gray-600">Matrícula: {alunoData?.matricula}</p>
            </div>

            <form onSubmit={handleCadastrarSenha} className="space-y-4">
              <div>
                <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
                  Nova Senha
                </label>
                <input
                  id="senha"
                  name="senha"
                  type="password"
                  required
                  value={formData.senha}
                  onChange={handleInputChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-700 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Digite uma senha"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Mínimo de 6 caracteres
                </p>
              </div>

              <div>
                <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700">
                  Confirmar Senha
                </label>
                <input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type="password"
                  required
                  value={formData.confirmarSenha}
                  onChange={handleInputChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-700 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Digite a senha novamente"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Cadastrando...
                    </div>
                  ) : (
                    'Cadastrar Senha'
                  )}
                </button>
              </div>

              {/* Mensagens */}
              {errorMessage && (
                <div className="text-center">
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {errorMessage}
                  </p>
                </div>
              )}
              
              {successMessage && (
                <div className="text-center">
                  <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                    {successMessage}
                  </p>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Link para login */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Já possui senha?{' '}
            <a 
              href="/login" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Fazer login
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>&copy; 2025 EEEP - Escola Estadual de Educação Profissional</p>
        </div>
      </div>
    </div>
  );
}
