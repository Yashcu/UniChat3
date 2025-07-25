export default function AuthErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Authentication Error</h2>
        <p>Please refresh the page to continue.</p>
      </div>
    </div>
  );
}
