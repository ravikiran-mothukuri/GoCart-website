import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, User, Smartphone, Lock } from "lucide-react";

export default function PartnerRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    mobile: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = () => {
    navigate("/delivery/login");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const registerPartner = async () => {
    if (!form.username || !form.mobile || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/delivery/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Registration failed");
      }

      // Success logic - simplified without alert
      navigate("/delivery/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
            <Truck size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white">Partner Signup</h1>
          <p className="mt-2 text-blue-100">Create your delivery account</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-center text-sm font-medium text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-gray-700">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                placeholder="Choose a username"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-gray-700">Mobile</label>
            <div className="relative">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                placeholder="Enter mobile number"
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="mb-2 block text-sm font-semibold text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                placeholder="Create a password"
              />
            </div>
          </div>

          <button
            onClick={registerPartner}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

          <div className="mt-6 text-center text-sm font-medium text-gray-600">
            Already have an account?{" "}
            <span
              onClick={handleLogin}
              className="cursor-pointer text-blue-600 hover:text-blue-700 hover:underline"
            >
              Login
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
