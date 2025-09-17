import { createContext, useContext, useEffect, useState, type JSX } from "react";

import { toast } from "react-toastify";
import UserStorage from "../services/storage/auth";
import type { UserProps } from "../types/user";
import useQuery from "../hooks/useQuery";
import { jwtDecode } from "jwt-decode";


interface ContextProvider {
  user: UserProps | null;
  Authentication: (token: string, refresh_token: string) => void;

}

export const AuthManager = createContext<ContextProvider>({} as ContextProvider);
const useAuth = () => useContext(AuthManager);


export const AuthProvider = ({ children }: { children: JSX.Element }) => {
  const { query, handleChangeQuery } = useQuery();
  const findToken = query.get("token");
  const [user, setUser] = useState<UserProps | null>(null)

  const isValidToken = (token: string) => {
    try {
      const decoded: any = jwtDecode(token);
      if (!decoded.exp) return false;
    } catch (error) {
      return false;
    }
  };

  const Authentication = async (token: string, refresh_token: string) => {
    if (isValidToken(token)) {
      toast.error("Token inválido")
      return
    }
    const user: UserProps = jwtDecode(token)
    setUser(user)
    UserStorage.saveUserStorage(user)
    UserStorage.saveTokenStorage({ access_token: token, refresh_token: refresh_token })
    query.delete('token');
    handleChangeQuery(null, token)
  }

  useEffect(() => {
    const findStorage = UserStorage.getTokenStorage()
    if (findToken || findStorage) {
      Authentication(findToken ?? (findStorage?.access_token ?? ""), findToken ?? (findStorage?.access_token ?? ""))
    }
  }, [findToken])


  return (
    <AuthManager.Provider value={{
      Authentication, user
    }}>
      {children}
    </AuthManager.Provider>
  )
}

export default useAuth;