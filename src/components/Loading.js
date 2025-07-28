/**
 * Componente de Loading para exibição durante carregamentos
 */
export default function Loading({ message = "Carregando...", size = "medium" }) {
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-12 w-12"
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}></div>
      {message && (
        <p className="mt-4 text-sm text-gray-600 text-center">{message}</p>
      )}
    </div>
  );
}

/**
 * Loading em tela cheia
 */
export function FullPageLoading({ message = "Carregando..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">{message}</p>
      </div>
    </div>
  );
}

/**
 * Loading inline para botões
 */
export function ButtonLoading() {
  return (
    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
  );
}
