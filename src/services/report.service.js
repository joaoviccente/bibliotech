import api from './api';

class ReportService {
  /**
   * Gera relatório de reservas em PDF
   */
  async generateReservasReport() {
    try {
      const response = await api.get('/admin/relatorios/reservas', {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });

      // Criar URL do blob para download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Criar link temporário para download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio-reservas-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Limpeza
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Relatório de reservas gerado com sucesso!' };
    } catch (error) {
      console.error('Erro ao gerar relatório de reservas:', error);
      throw new Error(error.response?.data?.message || 'Erro ao gerar relatório de reservas');
    }
  }

  /**
   * Gera ranking de leitura em PDF
   */
  async generateRankingReport() {
    try {
      const response = await api.get('/admin/relatorios/ranking', {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });

      // Criar URL do blob para download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Criar link temporário para download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ranking-leitura-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Limpeza
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Ranking de leitura gerado com sucesso!' };
    } catch (error) {
      console.error('Erro ao gerar ranking de leitura:', error);
      throw new Error(error.response?.data?.message || 'Erro ao gerar ranking de leitura');
    }
  }

  /**
   * Busca dados para preview do relatório de reservas
   */
  async getReservasData() {
    try {
      const response = await api.get('/admin/relatorios/reservas/data');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados de reservas:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar dados de reservas');
    }
  }

  /**
   * Busca dados para preview do ranking de leitura
   */
  async getRankingData() {
    try {
      const response = await api.get('/admin/relatorios/ranking/data');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados de ranking:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar dados de ranking');
    }
  }
}

// Instância única do serviço
const reportServiceInstance = new ReportService();

export default reportServiceInstance;
