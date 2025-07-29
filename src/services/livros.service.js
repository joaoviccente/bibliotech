import api from './api';

/**
 * Serviços relacionados aos livros
 */
const livrosService = {
  /**
   * Buscar todos os livros
   * @param {Object} filtros - Filtros opcionais (gênero, disponibilidade, etc.)
   * @returns {Promise} Lista de livros
   */
  async buscarTodos() {
    
    try {
      const response = await api.get('/livros/qtd-livros');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
      throw error;
    }
  },

  async buscarPorQtd() {
    
    try {
      const response = await api.get('/livros/qtd-livros/emprestados');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
      throw error;
    }
  },

  /**
   * Buscar livro por ID
   * @param {number} id - ID do livro
   * @returns {Promise} Dados do livro
   */
  async buscarPorId(id) {
    try {
      const response = await api.get(`/livros/id/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar livro por ID:', error);
      throw error;
    }
  },

  /**
   * Buscar livros por termo de pesquisa
   * @param {string} termo - Termo de busca (nome, autor, gênero)
   * @returns {Promise} Lista de livros encontrados
   */
  async buscarPorTermo(termo) {
    try {
      const response = await api.get(`/livros/buscar?q=${encodeURIComponent(termo)}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar livros por termo:', error);
      throw error;
    }
  },

  /**
   * Buscar livros por gênero
   * @param {string} genero - Gênero do livro
   * @returns {Promise} Lista de livros do gênero
   */
  async buscarPorGenero(genero) {
    try {
      const response = await api.get(`/livros/genero/${encodeURIComponent(genero)}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar livros por gênero:', error);
      throw error;
    }
  },

  /**
   * Buscar livros disponíveis
   * @param {boolean} apenasDisponiveis - Se true, retorna apenas livros com quantidade > 0
   * @returns {Promise} Lista de livros disponíveis
   */
  async buscarDisponiveis(apenasDisponiveis) {
    try {
      const params = apenasDisponiveis ? '?disponivel_apenas=true' : '';
      const response = await api.get(`/livros/disponiveis${params}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar livros disponíveis:', error);
      throw error;
    }
  },

  /**
   * Reservar livro
   * @param {number} idLivro - ID do livro
   * @returns {Promise} Resultado da reserva
   */
  async reservar(idLivro) {
    try {
      const response = await api.post('/livros/reservar', {
        id_livro: idLivro
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao reservar livro:', error);
      throw error;
    }
  },

  /**
   * Buscar histórico de livros do usuário
   * @returns {Promise} Lista de livros do usuário
   */
  async meuHistorico() {
    try {
      const response = await api.get('/livros/meu-historico');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      throw error;
    }
  },

  /**
   * Marcar livro como concluído
   * @param {number} idReserva - ID da reserva
   * @returns {Promise} Resultado da operação
   */
  async marcarConcluido(idReserva) {
    try {
      const response = await api.patch(`/livros/concluir/${idReserva}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao marcar livro como concluído:', error);
      throw error;
    }
  },

  /**
   * Renovar empréstimo
   * @param {number} idReserva - ID da reserva
   * @returns {Promise} Resultado da operação
   */
  async renovarEmprestimo(idReserva) {
    try {
      const response = await api.put(`/reservas/renovar/${idReserva}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao renovar empréstimo:', error);
      throw error;
    }
  },

  /**
   * Marcar livro como devolvido
   * @param {number} idReserva - ID da reserva
   * @returns {Promise} Resultado da operação
   */
  async marcarComoDevolvido(idReserva) {
    try {
      const response = await api.put(`/livros/devolver/${idReserva}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao marcar como devolvido:', error);
      throw error;
    }
  },

  /**
   * Buscar reservas pendentes (para administradores)
   * @returns {Promise} Lista de reservas pendentes
   */
  async buscarReservasPendentes() {
    
    try {
      const response = await api.get('/reservas/qtd-pendencias');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar reservas pendentes:', error);
      throw error;
    }
  },

  /**
   * Criar novo livro (para administradores)
   * @param {Object} dadosLivro - Dados do livro
   * @returns {Promise} Livro criado
   */
  async criar(dadosLivro) {
    try {
      const response = await api.post('/livros', dadosLivro);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar livro:', error);
      throw error;
    }
  },

  /**
   * Atualizar livro (para administradores)
   * @param {number} id - ID do livro
   * @param {Object} dadosLivro - Dados atualizados
   * @returns {Promise} Livro atualizado
   */
  async atualizar(id, dadosLivro) {
    try {
      const response = await api.put(`/livros/${id}`, dadosLivro);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar livro:', error);
      throw error;
    }
  }
};

export default livrosService;
