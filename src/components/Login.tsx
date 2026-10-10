import { useState, useEffect, useRef } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { useAuth } from "../lib/auth";
import { Settings, LogIn, LogOut, Trash } from "lucide-react";

interface Props {
  isSettings: boolean;
  setIsSettings: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Login = ({ isSettings, setIsSettings }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
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

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const settingsButton = !isSettings && (
    <button
      onClick={() => {
        setIsSettings(true);
        setIsOpen(false);
      }}
      className="w-full flex items-center px-4 py-2.5 text-[10px] uppercase tracking-widest text-blue-950/70 hover:bg-blue-950/5 hover:text-blue-950 transition-colors"
    >
      <Settings />
      <span className="ml-3">Settings</span>
    </button>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
      >
        <img
          src={user?.photoURL || "https://placehold.net/avatar.svg"}
          alt="Profile"
          className="size-7 rounded-full cursor-pointer"
        />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 backdrop-blur-md border border-blue-950/15 rounded-md shadow-xl shadow-blue-950/15 z-50 overflow-hidden">
          {user ? (
            <div className="flex flex-col">
              <div className="px-4 py-3 border-b border-blue-950/10 bg-blue-950/2">
                <p className="text-xs text-blue-950 font-bold truncate">
                  {user.displayName}
                </p>
                <p className="text-[10px] text-blue-950/50 truncate lowercase">
                  {user.email}
                </p>
              </div>

              {settingsButton}

              <div className="h-px w-full bg-blue-950/10" />

              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center px-4 py-2.5 text-[10px] uppercase tracking-widest text-blue-950/70 hover:bg-blue-950/5 hover:text-blue-950 transition-colors"
              >
                <LogOut />
                <span className="ml-3">Sign Out</span>
              </button>

              <button
                // onClick={() => {
                //   onDeleteAccount();
                //   setIsOpen(false);
                // }}
                className="w-full flex items-center px-4 py-2.5 text-[10px] uppercase tracking-widest text-rose-600/70 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              >
                <Trash />
                <span className="ml-3">Delete Account</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col py-1">
              <button
                onClick={() => {
                  handleLogin();
                  setIsOpen(false);
                }}
                className="w-full flex items-center px-4 py-2.5 text-[10px] uppercase tracking-widest text-blue-950/70 hover:bg-blue-950/5 hover:text-blue-950 transition-colors"
              >
                <LogIn />
                <span className="ml-3">Sign in with Google</span>
              </button>

              {settingsButton}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
