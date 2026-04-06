import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🔥 تحويل تلقائي
  if (!user) {
    redirect('/login');
  }

  return (
    <div>
      <h1>Welcome</h1>
      <p>User ID: {user.id}</p>
    </div>
  );
}
