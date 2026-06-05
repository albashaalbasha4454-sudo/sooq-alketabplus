type Props = { onLogin: () => Promise<void> };

export default function LoginView({ onLogin }: Props) {
  return <main dir="rtl"><h1>سوق الكتاب</h1><p>مكتبة ومنصة إدارة.</p><button onClick={() => void onLogin()}>تسجيل الدخول</button></main>;
}
