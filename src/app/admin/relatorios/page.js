'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { reportService } from '@/services';

export default function RelatoriosPage() {
  const [isGeneratingReservas, setIsGeneratingReservas] = useState(false);
  const [isGeneratingRanking, setIsGeneratingRanking] = useState(false);
  const router = useRouter();

  const handleGenerateReservasReport = async () => {
    try {
      setIsGeneratingReservas(true);
      await reportService.generateReservasReport();
    } catch (error) {
      console.error('Erro ao gerar relatório de reservas:', error);
      alert('Erro ao gerar relatório de reservas. Tente novamente.');
    } finally {
      setIsGeneratingReservas(false);
    }
  };

  const handleGenerateRankingReport = async () => {
    try {
      setIsGeneratingRanking(true);
      await reportService.generateRankingReport();
    } catch (error) {
      console.error('Erro ao gerar ranking de leitura:', error);
      alert('Erro ao gerar ranking de leitura. Tente novamente.');
    } finally {
      setIsGeneratingRanking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Relatórios
            </h2>
            <p className="text-gray-600">
              Gere relatórios em PDF sobre reservas e ranking de leitura
            </p>
          </div>
          
        </div>
      </div>

      {/* Cards de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Card - Relatório de Reservas */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Relatório de Reservas
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Documento PDF com todas as reservas de livros
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">O relatório inclui:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Lista completa de todas as reservas</li>
                <li>• Informações dos alunos (nome, matrícula, curso)</li>
                <li>• Detalhes dos livros (título, autor, gênero)</li>
                <li>• Datas de reserva e devolução prevista</li>
                <li>• Status atual das reservas</li>
                <li>• Dados organizados por data</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleGenerateReservasReport}
            disabled={isGeneratingReservas}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            {isGeneratingReservas ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Gerando PDF...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Gerar Relatório PDF
              </>
            )}
          </button>
        </div>

        {/* Card - Ranking de Leitura */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Ranking de Leitura
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Documento PDF com estatísticas de leitura dos alunos
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">O ranking inclui:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ranking dos alunos mais ativos</li>
                <li>• Total de livros lidos por aluno</li>
                <li>• Informações dos alunos (nome, matrícula, curso)</li>
                <li>• Livros mais populares</li>
                <li>• Gêneros mais lidos</li>
                <li>• Estatísticas gerais da biblioteca</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleGenerateRankingReport}
            disabled={isGeneratingRanking}
            className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            {isGeneratingRanking ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Gerando PDF...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Gerar Ranking PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Informações sobre os relatórios
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                • Os relatórios são gerados em tempo real com os dados mais atuais da biblioteca
              </p>
              <p>
                • Os arquivos PDF são baixados automaticamente após a geração
              </p>
              <p>
                • Recomendamos gerar os relatórios periodicamente para acompanhamento
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
