// Exportação centralizada de todos os serviços da aplicação BiblioTech

import apiInstance from './api';
import alunosServiceInstance from './alunos.service';
import livrosServiceInstance from './livros.service';
import authServiceInstance from './auth.service';
import reportServiceInstance from './report.service';

// Exportações default
export { default as api } from './api';
export { default as alunosService } from './alunos.service';
export { default as livrosService } from './livros.service';
export { default as authService } from './auth.service';
export { default as reportService } from './report.service';

// Exportação nomeada para facilitar importações específicas
export {
  alunosServiceInstance as alunos,
  livrosServiceInstance as livros,
  authServiceInstance as auth,
  reportServiceInstance as reports
};
