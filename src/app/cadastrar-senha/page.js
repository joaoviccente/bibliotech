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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Card Principal */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-medium text-gray-900">Cadastrar Senha</h2>
              <p className="text-sm text-gray-600 mt-2">
                {step === 1 
                  ? 'Digite sua matrícula para verificação' 
                  : 'Crie uma senha para acessar o sistema'
                }
              </p>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step >= 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`h-1 w-8 transition-colors ${step >= 2 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step >= 2 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
            </div>

            {/* Step 1: Verificar Matrícula */}
            {step === 1 && (
              <form onSubmit={handleVerificarMatricula} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MATRÍCULA
                  </label>
                  <input
                    name="matricula"
                    type="text"
                    required
                    value={formData.matricula}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-200 focus:border-green-500 pr-10 text-gray-400"
                    placeholder="Digite sua matrícula"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Digite a matrícula que foi fornecida pela escola
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? 'VERIFICANDO...' : 'VERIFICAR MATRÍCULA'}
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
              <div>
                {/* Dados do aluno */}
                <div className="mb-6 p-4 bg-gray-50 rounded-md border">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Dados confirmados:</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Nome:</span> {alunoData?.nome}</p>
                    <p><span className="font-medium">Curso:</span> {alunoData?.curso}</p>
                    <p><span className="font-medium">Matrícula:</span> {alunoData?.matricula}</p>
                  </div>
                </div>

                <form onSubmit={handleCadastrarSenha} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NOVA SENHA
                    </label>
                    <input
                      name="senha"
                      type="password"
                      required
                      value={formData.senha}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-200 focus:border-green-500 pr-10 text-gray-400"
                      placeholder="Digite uma senha"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Mínimo de 6 caracteres
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CONFIRMAR SENHA
                    </label>
                    <input
                      name="confirmarSenha"
                      type="password"
                      required
                      value={formData.confirmarSenha}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-200 focus:border-green-500 pr-10 text-gray-400"
                      placeholder="Digite a senha novamente"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium"
                    >
                      VOLTAR
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-3 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {isLoading ? 'CADASTRANDO...' : 'CADASTRAR SENHA'}
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
          </div>

          {/* Link para login */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Já possui senha?{' '}
              <a 
                href="/login" 
                className="text-green-600 hover:text-green-500 font-medium"
              >
                Fazer login
              </a>
            </p>
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
