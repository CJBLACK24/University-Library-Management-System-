import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export default function LogoutForm() {
  return (
    <form action={logout}>
      <Button
        type="submit"
        variant="destructive"
        className="bg-red-500 hover:bg-red-600 text-white"
      >
        Log out
      </Button>
    </form>
  );
}

