import api from './api';

/**
 * Serviços relacionados aos alunos
 */
const alunosService = {
  /**
   * Buscar todos os alunos
   * @returns {Promise} Lista de alunos
   */
  async buscarTodos() {
    try {
      const response = await api.get('/alunos/qtd-alunos');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      throw error;
    }
  },

  /**
   * Buscar aluno por ID
   * @param {number} id - ID do aluno
   * @returns {Promise} Dados do aluno
   */
  async buscarPorId(id) {
    try {
      const response = await api.get(`/alunos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar aluno por ID:', error);
      throw error;
    }
  },

  /**
   * Buscar aluno por matrícula
   * @param {string} matricula - Matrícula do aluno
   * @returns {Promise} Dados do aluno
   */
  async buscarPorMatricula(matricula) {
    try {
      const response = await api.get(`/auth/aluno/buscar/matricula/${matricula}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar aluno por matrícula:', error);
      throw error;
    }
  },

  /**
   * Cadastrar senha para o aluno
   * @param {string} matricula - Matrícula do aluno
   * @param {string} senha - Nova senha
   * @param {string} confirmarSenha - Confirmação da senha
   * @returns {Promise} Resultado do cadastro
   */
  async cadastrarSenha(matricula, senha, confirmarSenha) {
    try {
      const response = await api.post('/auth/aluno/cadastrar-senha', {
        matricula,
        senha,
        confirmarSenha
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao cadastrar senha:', error);
      throw error;
    }
  },

  /**
   * Buscar perfil do aluno logado
   * @returns {Promise} Dados do perfil
   */
  async meuPerfil() {
    try {
      const response = await api.get('/alunos/perfil');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      throw error;
    }
  },

  /**
   * Buscar ranking de alunos
   * @param {string} periodo - Período para o ranking (mes, trimestre, semestre, ano)
   * @returns {Promise} Lista do ranking
   */
  async ranking(periodo = 'mes') {
    try {
      const response = await api.get(`/alunos/ranking?periodo=${periodo}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
      throw error;
    }
  },

  /**
   * Buscar estatísticas do aluno
   * @param {number} idAluno - ID do aluno (opcional, se não fornecido usa o aluno logado)
   * @returns {Promise} Estatísticas do aluno
   */
  async estatisticas(idAluno = null) {
    try {
      const url = idAluno ? `/alunos/${idAluno}/estatisticas` : '/alunos/estatisticas';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  },

  /**
   * Atualizar perfil do aluno
   * @param {Object} dadosAluno - Dados atualizados do aluno
   * @returns {Promise} Dados atualizados
   */
  async atualizarPerfil(dadosAluno) {
    try {
      const response = await api.put('/alunos/perfil', dadosAluno);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  },

  /**
   * Buscar histórico de leitura do aluno
   * @param {number} idAluno - ID do aluno (opcional)
   * @returns {Promise} Histórico de leitura
   */
  async historicoLeitura(idAluno = null) {
    try {
      const url = idAluno ? `/alunos/${idAluno}/historico` : '/alunos/historico';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar histórico de leitura:', error);
      throw error;
    }
  },

  /**
   * Buscar livros favoritos do aluno
   * @returns {Promise} Lista de livros favoritos
   */
  async livrosFavoritos() {
    try {
      const response = await api.get('/alunos/favoritos');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar livros favoritos:', error);
      throw error;
    }
  },

  /**
   * Marcar/desmarcar livro como favorito
   * @param {number} idLivro - ID do livro
   * @returns {Promise} Resultado da operação
   */
  async toggleFavorito(idLivro) {
    try {
      const response = await api.post('/alunos/favoritos/toggle', { id_livro: idLivro });
      return response.data;
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
      throw error;
    }
  },

  /**
   * Buscar recomendações personalizadas
   * @returns {Promise} Lista de livros recomendados
   */
  async recomendacoes() {
    try {
      const response = await api.get('/alunos/recomendacoes');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar recomendações:', error);
      throw error;
    }
  }
};

export default alunosService;
