import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        console.log('Attempting to reset password for:', email);

        try {
            // Check if function exists
            if (!supabase.auth.resetPasswordForEmail) {
                throw new Error('Supabase client is not configured correctly or function is missing.');
            }

            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });

            console.log('Supabase response:', { data, error });

            if (error) throw error;

            setMessage('Check your email for the password reset link.');
        } catch (err) {
            console.error('Reset password error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-neutral-100">
                <div>
                    <Link to="/auth/login" className="flex items-center text-sm text-neutral-500 hover:text-neutral-900 mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to sign in
                    </Link>
                    <h2 className="mt-2 text-3xl font-bold text-neutral-900 tracking-tight text-center">
                        Reset password
                    </h2>
                    <p className="mt-2 text-sm text-neutral-600 text-center">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
                    {error && (
                        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
                            {message}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                            Email address
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-neutral-400" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 px-4 py-3 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition duration-200"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-neutral-900 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Sending link...' : 'Send reset link'}
                    </button>
                </form>
            </div>
        </div>
    );
}
