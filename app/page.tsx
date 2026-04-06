import { createClient } from '@/lib/supabase-server';

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🔥 أهم سطر: منع الكراش
  if (!user) {
    return <div>Not logged in</div>;
  }

  return (
    <div>
      <h1>Welcome</h1>
      <p>User ID: {user.id}</p>
    </div>
  );
}
