import { Link } from 'react-router-dom';

export default function VerifyEmail() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Check your email</h2>
                <p className="text-neutral-600 mb-8">
                    We've sent a verification link to your email address. Please click the link to activate your account.
                </p>
                <div className="space-y-4">
                    <Link to="/auth/signIn" className="block w-full py-3 px-4 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition">
                        Back to Sign In
                    </Link>
                    <button onClick={() => window.location.reload()} className="text-sm text-neutral-500 hover:text-neutral-900 underline">
                        I've verified my email
                    </button>
                </div>
            </div>
        </div>
    );
}
