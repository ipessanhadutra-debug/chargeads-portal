"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  type User = {
  id: string;
  email?: string;
};

type Screen = {
  id: string;
  name: string;
  user_id: string;
};

const [user, setUser] = useState<User | null>(null);
const [screens, setScreens] = useState<Screen[]>([]);


  // Your admin email
  const ADMIN_EMAIL = "ipessanha@ymail.com";

  // Load user on mount
  useEffect(() => {
  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    const supaUser = data?.user;

    if (!supaUser) {
      router.push("/");
    } else {
      setUser({
        id: supaUser.id,
        email: supaUser.email ?? undefined,
      });
      fetchScreens(supaUser.id);
    }
  };
  getUser();
}, [router]);


  // Fetch screens from Supabase
  const fetchScreens = async (userId: string) => {
    const { data, error } = await supabase
      .from("screens")
      .select("*")
      .eq("user_id", userId);

    if (error) console.error("Error fetching screens", error);
    setScreens(data || []);
    setLoading(false);
  };

  // Upload ads to Supabase Storage
  const handleUpload = async (screenName: string, file: File) => {
    if (!user) return;

    const filePath = `${user.id}/${screenName}/${file.name}`;

    const { error } = await supabase.storage
      .from("ads") // 👈 Make sure you created a bucket called "ads" in Supabase Storage
      .upload(filePath, file, { upsert: true });

    if (error) {
      alert("Upload failed: " + error.message);
    } else {
      alert(`✅ Uploaded ${file.name} to ${screenName}`);
    }
  };

  // Admin only: Add screen for this user
  const handleAddScreen = async () => {
    if (!user || user.email !== ADMIN_EMAIL) return;

    const screenName = prompt("Enter screen name (e.g. Screen 4):");
    if (!screenName) return;

    const { error } = await supabase
      .from("screens")
      .insert([{ user_id: user.id, name: screenName }]);

    if (error) {
      alert("Error creating screen: " + error.message);
    } else {
      fetchScreens(user.id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>Welcome, {user?.email}</h2>
      <p>This is your dashboard.</p>

      {user?.email === ADMIN_EMAIL && (
        <button
          onClick={handleAddScreen}
          style={{
            background: "#0070f3",
            color: "white",
            padding: "8px 12px",
            marginBottom: "16px",
            border: "none",
            cursor: "pointer",
            borderRadius: 4,
          }}
        >
          + Add Screen
        </button>
      )}

      <div>
        {screens.length === 0 ? (
          <p>No screens found.</p>
        ) : (
          screens.map((screen) => (
            <div
              key={screen.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: "12px",
                marginBottom: "12px",
              }}
            >
              <strong>{screen.name}</strong>
              <div style={{ marginTop: 8 }}>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleUpload(screen.name, e.target.files[0]);
                    }
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={handleLogout}
        style={{
          background: "red",
          color: "white",
          padding: "8px 12px",
          marginTop: "20px",
          border: "none",
          cursor: "pointer",
          borderRadius: 4,
        }}
      >
        Logout
      </button>
    </div>
  );
}
