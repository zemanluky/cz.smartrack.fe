import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/stores/authStore";
import { useUserStore } from "@/lib/stores/userStore";
import { useOrganizationStore } from "@/lib/stores/organizationsStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const loginUser = useAuthStore((state) => state.loginUser);
  const token = useAuthStore((state) => state.token);
  const isSessionRestored = useAuthStore((state) => state.isSessionRestored);
  const fetchCurrentUser = useUserStore((state) => state.fetchCurrentUser);
  const { currentUser } = useUserStore();
  const setSelectedOrganizationId = useOrganizationStore((state) => state.setSelectedOrganizationId);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSessionRestored) {
      return;
    }

    if (token && currentUser) {
      if (currentUser.role === "sys_admin") {
        navigate("/organizations");
      } else if (currentUser.role === "org_admin") {
        if (currentUser.organization?.id) {
          setSelectedOrganizationId(String(currentUser.organization.id));
        }
        navigate("/dashboard");
      }
    }
  }, [token, currentUser, navigate, isSessionRestored, setSelectedOrganizationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const token = await loginUser(email, password);
      if (token) {
        const userFetched = await fetchCurrentUser();
        if (userFetched) {
          const user = useUserStore.getState().currentUser;

          if (user) {
            if (user.role === "sys_admin") {
              navigate("/organizations");
            } else if (user.role === "org_admin") {
              if (user.organization?.id) {
                setSelectedOrganizationId(String(user.organization.id));
                navigate("/dashboard");
              } else {
                setError("Chybí ID organizace pro správce organizace.");
              }
            } else {
              setError("Neznámá role uživatele.");
            }
          } else {
            setError("Nepodařilo se načíst údaje o uživateli po přihlášení.");
          }
        } else {
          setError("Nepodařilo se načíst údaje o uživateli.");
        }
      } else {
        setError("Neplatné přihlašovací údaje.");
      }
    } catch (err) {
      setError("Něco se pokazilo. Zkuste to prosím znovu.");
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Heslo"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              Přihlásit se
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
