import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation, type ApolloError } from "@apollo/client";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { LOGIN } from "@/features/auth/graphql";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loginMutation, { loading }] = useMutation(LOGIN, {
    onCompleted: (data: {
      login: {
        accessToken: string;
        refreshToken: string;
        user: { id: string; username: string };
      };
    }) => {
      const { accessToken, refreshToken, user } = data.login;
      login(accessToken, refreshToken, user);
      const from = (location.state as { from?: { pathname: string } })?.from
        ?.pathname;
      navigate(from || "/employees", { replace: true });
    },
    onError: (error: ApolloError) => {
      if (error.networkError) {
        setErrors({ form: "Unable to connect. Is the server running?" });
        return;
      }
      const code = error.graphQLErrors?.[0]?.extensions?.code;
      if (code === "UNAUTHORIZED") {
        setErrors({ form: "Invalid username or password." });
      } else {
        setErrors({ form: "Something went wrong. Please try again." });
      }
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/employees", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({
      username: username.trim(),
      password,
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    loginMutation({ variables: result.data });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Better HR
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage your employees
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                {errors.form}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
              {errors.username && (
                <p className="text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Demo credentials: admin / password123
        </p>
      </div>
    </div>
  );
}
