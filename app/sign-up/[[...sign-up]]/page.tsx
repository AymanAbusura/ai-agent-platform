import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#09090b' }}>
      {/* <SignUp /> */}
      <SignUp
        forceRedirectUrl="/dashboard"
        signInUrl="/sign-in"
      />
    </main>
  );
}
