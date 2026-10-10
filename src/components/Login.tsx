import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { useAuth } from "../lib/auth";

export const Login = () => {
  const { user, setUser } = useAuth();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = async () => {
    const isConfirmed = window.confirm("Are you sure you want to sign out?");
    if (isConfirmed) {
      await signOut(auth);
      setUser(null);
    }
  };

  return (
    <button onClick={user ? handleLogout : handleLogin}>
      <img
        src={user?.photoURL || "https://placehold.net/avatar.svg"}
        alt="Profile"
        className="size-7 rounded-full cursor-pointer"
      />
    </button>
  );
};
