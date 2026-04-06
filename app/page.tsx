import { Header } from '@/components/header';
import { VisitForm } from '@/components/visit-form';
import { createClient } from '@/lib/supabase-server';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="container">
      <Header />
      <VisitForm userId={user!.id} />
      <div className="footer-note">نسخة MVP مجانية قابلة للرفع على GitHub والنشر على Vercel.</div>
    </main>
  );
}
