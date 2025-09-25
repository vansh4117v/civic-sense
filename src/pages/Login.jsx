import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Sparkles } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const loginSchema = z.object({
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phoneNumber: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");

    try {
      await login(data.phoneNumber, data.password, data.rememberMe);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const rememberMe = watch("rememberMe");

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
      {/* Logo and Brand */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <h1 className="text-4xl font-bold">
            <span className="text-green-800">Civic</span>
            <span className="text-green-600">Sense</span>
          </h1>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sign-In</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Phone Number Field */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">
            Phone No.
          </Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="Enter a valid number."
            {...register("phoneNumber")}
            className={`bg-gray-50 border-gray-300 focus:border-green-500 focus:ring-green-500 py-3 text-base placeholder:text-gray-400 placeholder:font-normal ${
              errors.phoneNumber ? "border-red-500" : ""
            }`}
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700 font-medium">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="•••••••"
            {...register("password")}
            className={`bg-gray-50 border-gray-300 focus:border-green-500 focus:ring-green-500 py-3 text-base placeholder:text-gray-400 placeholder:font-normal ${
              errors.password ? "border-red-500" : ""
            }`}
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        {/* Remember Me and Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setValue("rememberMe", checked)}
              className="border-gray-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
            />
            <Label htmlFor="rememberMe" className="text-sm text-gray-700 cursor-pointer">
              Remember me
            </Label>
          </div>
          <button
            type="button"
            className="text-sm text-green-700 hover:text-green-800 hover:underline font-medium"
            onClick={() => console.log("Forgot password clicked")}
          >
            Forgot Password?
          </button>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-semibold py-4 rounded-xl transition-colors duration-200 text-lg mt-6"
        >
          {isLoading ? "Logging in..." : "Login to CivicSense"}
        </button>
      </form>
    </div>
  );
}
