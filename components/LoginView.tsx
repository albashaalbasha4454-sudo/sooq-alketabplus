type Props = { onLogin: () => Promise<void> };

export default function LoginView({ onLogin }: Props) {
  return <button onClick={() => void onLogin()}>Login</button>;
}
