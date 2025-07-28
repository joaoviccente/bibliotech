import api from './api';

/**
 * Serviços relacionados à autenticação e administração
 */
const authService = {
  /**
   * Login do administrador
   * @param {string} nome - Nome do administrador
   * @param {string} senha - Senha do administrador
   * @returns {Promise} Dados de autenticação
   */
  async loginAdmin(nome, senha) {
    try {
      const response = await api.post('/auth/admin/login', {
        nome,
        senha
      });
      
      // Salvar token no localStorage se o login for bem-sucedido
      if (response.data.token) {
        localStorage.setItem('bibliotech_token', response.data.token);
        localStorage.setItem('bibliotech_user', JSON.stringify(response.data.user));
        localStorage.setItem('bibliotech_user_type', 'admin');
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer login do admin:', error);
      throw error;
    }
  },

  /**
   * Login do aluno
   * @param {string} matricula - Matrícula do aluno
   * @param {string} senha - Senha do aluno
   * @returns {Promise} Dados de autenticação
   */
  async loginAluno(matricula, senha) {
    try {
      const response = await api.post('/auth/aluno/login', {
        matricula,
        senha
      });
      
      // Salvar token no localStorage se o login for bem-sucedido
      if (response.data.token) {
        localStorage.setItem('bibliotech_token', response.data.token);
        localStorage.setItem('bibliotech_user', JSON.stringify(response.data.user));
        localStorage.setItem('bibliotech_user_type', 'aluno');
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer login do aluno:', error);
      throw error;
    }
  },

  /**
   * Logout do usuário
   * @returns {Promise} Resultado da operação
   */
  async logout() {
    try {
      // Remover dados do localStorage
      localStorage.removeItem('bibliotech_token');
      localStorage.removeItem('bibliotech_user');
      localStorage.removeItem('bibliotech_user_type');
      
      return { success: true, message: 'Logout realizado com sucesso' };
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, limpar dados locais
      localStorage.removeItem('bibliotech_token');
      localStorage.removeItem('bibliotech_user');
      localStorage.removeItem('bibliotech_user_type');
      
      return { success: true, message: 'Logout realizado com sucesso' };
    }
  },

  /**
   * Verificar se o usuário está autenticado
   * @returns {boolean} Status de autenticação
   */
  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('bibliotech_token');
    const user = localStorage.getItem('bibliotech_user');
    
    return !!(token && user);
  },

  /**
   * Obter dados do usuário logado
   * @returns {Object|null} Dados do usuário ou null
   */
  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    
    try {
      const user = localStorage.getItem('bibliotech_user');
      const userType = localStorage.getItem('bibliotech_user_type');
      
      if (user && userType && user !== 'undefined' && user !== 'null') {
        const parsedUser = JSON.parse(user);
        return {
          ...parsedUser,
          userType
        };
      }
    } catch (error) {
      console.error('Erro ao fazer parse dos dados do usuário:', error);
      // Limpar dados corrompidos
      localStorage.removeItem('bibliotech_user');
      localStorage.removeItem('bibliotech_user_type');
      localStorage.removeItem('bibliotech_token');
    }
    
    return null;
  },

  /**
   * Obter token de autenticação
   * @returns {string|null} Token ou null
   */
  getToken() {
    if (typeof window === 'undefined') return null;
    
    return localStorage.getItem('bibliotech_token');
  },

  /**
   * Verificar se o usuário é administrador
   * @returns {boolean} Se é administrador
   */
  isAdmin() {
    if (typeof window === 'undefined') return false;
    
    const userType = localStorage.getItem('bibliotech_user_type');
    return userType === 'admin';
  },

  /**
   * Verificar se o usuário é aluno
   * @returns {boolean} Se é aluno
   */
  isAluno() {
    if (typeof window === 'undefined') return false;
    
    const userType = localStorage.getItem('bibliotech_user_type');
    return userType === 'aluno';
  },

  /**
   * Validar token com o servidor
   * @returns {Promise} Resultado da validação
   */
  async validateToken() {
    try {
      const response = await api.get('/auth/validate');
      return response.data;
    } catch (error) {
      console.error('Erro ao validar token:', error);
      // Se o token é inválido, fazer logout
      this.logout();
      throw error;
    }
  },

  /**
   * Solicitar reset de senha
   * @param {string} matricula - Matrícula do aluno
   * @returns {Promise} Resultado da solicitação
   */
  async solicitarResetSenha(matricula) {
    try {
      const response = await api.post('/auth/reset-senha/solicitar', {
        matricula
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao solicitar reset de senha:', error);
      throw error;
    }
  },

  /**
   * Redefinir senha
   * @param {string} token - Token de reset
   * @param {string} novaSenha - Nova senha
   * @returns {Promise} Resultado da operação
   */
  async redefinirSenha(token, novaSenha) {
    try {
      const response = await api.post('/auth/reset-senha/confirmar', {
        token,
        novaSenha
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      throw error;
    }
  }
};

export default authService;
