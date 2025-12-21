// src/pages/HomePage.jsx
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useAuth } from '../hooks/useAuth';
<<<<<<< HEAD
import { Smartphone, Car, Armchair, Shirt, Trophy, Book, Star } from 'lucide-react';

=======
import { Smartphone, Car, Armchair, Shirt, Volleyball, Library } from 'lucide-react';
>>>>>>> 89802b4239f29723c520e1b060fd7fa11471c769
export default function Home() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <SEO
        title="Home"
        description="Discover the best deals on Next Up. Buy and sell electronics, fashion, cars, and more in Egypt."
      />
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
<<<<<<< HEAD
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Buy & Sell <br />
              <span className="text-neutral-900 bg-white px-2 mt-2 inline-block transform -rotate-2">
                Anything Today
              </span>
            </h1>
            <p className="text-lg md:text-xl mb-8 font-light text-neutral-100">
              Join thousands of users on Next Up. list your items for free or find great deals near you.
            </p>
          </div>
=======
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 max-w-3xl mx-auto tracking-tight">
            Buy & Sell Gently Used Gear <br />
            <span className="text-neutral-500">Across Egypt — Safely & Locally</span>
          </h1>
          <p className="mt-6 text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Next Up is Egypt’s trusted local marketplace for buying and selling secondhand items from electronics and furniture to bikes and fashion quickly, securely, and completely free.
          </p>
>>>>>>> 89802b4239f29723c520e1b060fd7fa11471c769
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            {!user && (
              <Link
                to="/auth/signup"
                className="px-8 py-4 bg-neutral-900 text-white font-medium rounded-lg shadow-sm hover:bg-neutral-800 transition duration-200"
              >
                Join Free — Start Trading Today
              </Link>
            )}
            <Link
              to="/products"
              className="px-8 py-4 bg-white text-neutral-900 font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 transition duration-200"
            >
              Browse Listings in Egypt
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-neutral-50 border-t border-b border-neutral-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-neutral-900">12K+</div>
              <div className="text-neutral-500 mt-1 text-sm uppercase tracking-wide">Active Listings in Egypt</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-neutral-900">7.5K+</div>
              <div className="text-neutral-500 mt-1 text-sm uppercase tracking-wide">Happy Egyptian Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-neutral-900 flex items-center justify-center gap-1">
                4.8 <Star className="w-6 h-6 fill-current text-yellow-500" />
              </div>
              <div className="text-neutral-500 mt-1 text-sm uppercase tracking-wide">Trusted by Buyers & Sellers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-neutral-900">24h</div>
              <div className="text-neutral-500 mt-1 text-sm uppercase tracking-wide">Fast Local Responses</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">How Next Up Works</h2>
            <p className="mt-4 text-neutral-600">
              Three simple steps to buy or sell secondhand items across Cairo, Alexandria, Giza, and beyond with no fees and no middlemen.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-900 font-bold text-xl">
                1
              </div>
              <h3 className="mt-6 text-xl font-semibold text-neutral-900">Create Your Account</h3>
              <p className="mt-3 text-neutral-500 leading-relaxed">
                Sign up in seconds no phone verification required. Start your journey on Egypt’s favorite free classifieds platform.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-900 font-bold text-xl">
                2
              </div>
              <h3 className="mt-6 text-xl font-semibold text-neutral-900">List or Discover Items</h3>
              <p className="mt-3 text-neutral-500 leading-relaxed">
                Post your used gear in under a minute, or browse thousands of local listings near you from Cairo to Sharm El Sheikh.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-900 font-bold text-xl">
                3
              </div>
              <h3 className="mt-6 text-xl font-semibold text-neutral-900">Chat & Meet Safely</h3>
              <p className="mt-3 text-neutral-500 leading-relaxed">
                Connect directly with buyers or sellers via secure in-app messaging. Arrange meetups in safe, public places across Egypt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Popular Categories in Egypt</h2>
            <p className="mt-4 text-neutral-600">
              See what Egyptians are buying and selling from Cairo apartments to Red Sea diving gear.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 flex items-center justify-center">
            {[
<<<<<<< HEAD
              { name: 'Electronics', icon: <Smartphone className="w-8 h-8" /> },
              { name: 'Vehicles', icon: <Car className="w-8 h-8" /> },
              { name: 'Furniture', icon: <Armchair className="w-8 h-8" /> },
              { name: 'Clothing', icon: <Shirt className="w-8 h-8" /> },
              { name: 'Sports', icon: <Trophy className="w-8 h-8" /> },
              { name: 'Books', icon: <Book className="w-8 h-8" /> },
=======
              { name: 'Electronics', icon: <Smartphone /> },
              { name: 'Vehicles', icon: <Car /> },
              { name: 'Furniture', icon: <Armchair /> },
              { name: 'Clothing', icon: <Shirt /> },
              { name: 'Sports', icon: <Volleyball /> },
              { name: 'Books', icon: <Library /> },
>>>>>>> 89802b4239f29723c520e1b060fd7fa11471c769
            ].map((cat, i) => (
              <Link
                key={i}
                to={`/products?category=${cat.name}`}
                className="bg-white p-6 rounded-xl border border-neutral-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center group"
              >
                <div className="flex justify-center text-3xl mb-3 group-hover:scale-110 transition duration-300">{cat.icon}</div>
                <div className="font-medium text-neutral-900">{cat.name}</div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center text-neutral-900 font-medium hover:text-neutral-700 underline underline-offset-4"
            >
              Explore all categories in Egypt →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 bg-neutral-900">
          <div className="container mx-auto px-4 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mx-auto tracking-tight">
              Ready to Declutter or Discover Deals in Egypt?
            </h2>
            <p className="mt-6 text-neutral-400 max-w-xl mx-auto text-lg">
              Join thousands of Egyptians using Next Up — the free, local, and trusted way to trade secondhand items nationwide.
            </p>
            <div className="mt-10">
              <Link
                to="/auth/signup"
                className="px-8 py-4 bg-white text-neutral-900 font-bold rounded-lg shadow-lg hover:bg-neutral-100 transition duration-200"
              >
                Create Your Free Account Now
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer Placeholder */}
      <footer className="py-8 bg-white border-t border-neutral-200">
        <div className="container mx-auto px-4 text-center text-neutral-500 text-sm">
          © {new Date().getFullYear()} Next Up. Egypt’s favorite free marketplace for buying and selling used items locally.
        </div>
      </footer>
    </div>
  );
}
