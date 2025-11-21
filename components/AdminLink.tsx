"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyAdminPasscode } from "@/lib/actions/admin";

const AdminLink = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await verifyAdminPasscode(passcode);
      
      if (result.success) {
        setIsOpen(false);
        setPasscode("");
        router.push("/admin");
        router.refresh();
      } else {
        setError(result.error || "Incorrect passcode. Please try again.");
        setPasscode("");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setPasscode("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setPasscode("");
    setError("");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-white hover:text-light-100"
      >
        Admin
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={handleClose}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-dark-300 p-8 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 text-light-400 hover:text-white"
              aria-label="Close"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <h2 className="mb-2 text-2xl font-semibold text-white">
              Admin Access
            </h2>
            <p className="mb-6 text-sm text-light-400">
              Please enter the admin passcode to continue.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passcode" className="text-white">
                  Passcode
                </Label>
                <Input
                  id="passcode"
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode"
                  className="bg-dark-600 border-dark-700 text-white placeholder:text-light-500 focus:border-primary focus:ring-primary"
                  autoFocus
                />
                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-dark-600 bg-dark-600 text-white hover:bg-dark-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-primary text-dark-100 hover:bg-primary/90 disabled:opacity-50"
                >
                  {isLoading ? "Verifying..." : "Submit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminLink;

