/**
 * Componente de notificação simples usando alert nativo
 * Para desenvolvimento rápido
 */
export const simpleAlert = {
  success: (message) => {
    alert(`✅ Sucesso: ${message}`);
  },
  
  error: (message) => {
    alert(`❌ Erro: ${message}`);
  },
  
  warning: (message) => {
    alert(`⚠️ Aviso: ${message}`);
  },
  
  info: (message) => {
    alert(`ℹ️ Info: ${message}`);
  }
};

/**
 * Hook simplificado para alertas
 */
export function useSimpleAlert() {
  return {
    showSuccess: simpleAlert.success,
    showError: simpleAlert.error,
    showWarning: simpleAlert.warning,
    showInfo: simpleAlert.info
  };
}
