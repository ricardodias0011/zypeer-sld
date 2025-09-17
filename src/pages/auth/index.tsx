import { Button } from '@radix-ui/themes';
import alienAuth from "../../assets/alien-auth.png"
export function LoginRequiredPage() {

  const handleLoginRedirect = () => {
    document.location.href = `http://edu.zypeer.com.br/auth/login?next=${btoa("slides-app")}`
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4 bg-light-col ">
      <div className="max-w-md w-full bg-white shadow-md rounded-xl p-6 text-center space-y-4 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          Login necessário
        </h1>
        <p className="text-gray-600">
          Você precisa estar logado para acessar esta página.
        </p>
        <img src={alienAuth} alt="auth require" width="300" />
        <Button onClick={handleLoginRedirect} style={{ width: "100%" }} className="w-full" color="purple">
          Fazer login
        </Button>
      </div>
    </div>
  );
}
