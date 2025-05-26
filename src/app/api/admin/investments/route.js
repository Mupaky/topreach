import { createServerClient } from '@/utils/supabase/server';
import { getSession } from '@/utils/lib';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createServerClient();
  const session = await getSession();

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json(
      { message: 'Само администратори имат достъп.' },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from('investment_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Supabase error:', error);
    return NextResponse.json({ message: 'Грешка при зареждане на заявки.' }, { status: 500 });
  }

  return NextResponse.json({ submissions: data });
}
