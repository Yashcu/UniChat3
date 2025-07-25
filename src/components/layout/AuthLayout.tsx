import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" aria-label="Go to UniChat homepage" title="UniChat Home">
          <div className="flex items-center space-x-2 justify-center">
            <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">
                U
              </span>
            </div>
            <span className="font-bold text-2xl text-gray-900">UniChat</span>
          </div>
        </Link>

        <p className="mt-2 text-center text-sm text-gray-600">Campus Connect</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">{children}</div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          © 2024 UniChat Campus Connect. All rights reserved.
        </p>
      </div>
    </div>
  );
}
