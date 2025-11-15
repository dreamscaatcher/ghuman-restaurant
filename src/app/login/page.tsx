import { LoginForm } from "./_components/LoginForm";

type LoginPageProps = {
  searchParams: {
    redirect?: string;
    error?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const redirectTarget = searchParams?.redirect ?? "/";
  return <LoginForm redirectTo={redirectTarget} initialError={searchParams?.error} />;
}
