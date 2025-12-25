import { Link } from "react-router-dom";
import { ShoppingBag, Truck, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-black text-gray-900 md:text-5xl">
            Welcome to <span className="text-green-600">GoCart</span>
          </h1>
          <p className="text-xl text-gray-500">
            Select your role to continue
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Customer Card */}
          <Link
            to="/login"
            className="group relative flex flex-col items-center overflow-hidden rounded-3xl bg-white p-10 text-center shadow-xl transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/20"
          >
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg shadow-green-500/30 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <ShoppingBag size={40} />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-gray-900">
              I am a Customer
            </h2>
            <p className="mb-8 text-gray-500">
              Browse products, manage your wishlist, and place orders for quick delivery.
            </p>
            <div className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 py-4 font-bold text-green-700 transition-colors group-hover:bg-green-50">
              Continue Shopping <ArrowRight size={20} />
            </div>
          </Link>

          {/* Delivery Partner Card */}
          <Link
            to="/delivery/login"
            className="group relative flex flex-col items-center overflow-hidden rounded-3xl bg-white p-10 text-center shadow-xl transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20"
          >
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <Truck size={40} />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-gray-900">
              Delivery Partner
            </h2>
            <p className="mb-8 text-gray-500">
              Manage deliveries, track earnings, and view your assigned orders.
            </p>
            <div className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 py-4 font-bold text-blue-700 transition-colors group-hover:bg-blue-50">
              Partner Login <ArrowRight size={20} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
