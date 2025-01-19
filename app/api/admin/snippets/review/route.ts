import { createServerClien } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const ADMIN_CODE = process.env.ADMIN_CODE || 'YOUR_ADMIN_CODE';

export async function POST(request: Request) {
  try {
    const { snippetId, action, adminCode } = await request.json();

    if (adminCode !== ADMIN_CODE) {
      return NextResponse.json({ error: 'Invalid admin code' }, { status: 401 });
    }

    const supabase = createServerClien();
    
    const { error } = await supabase
      .from('code_snippets')
      .update({ status: action })
      .eq('id', snippetId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reviewing snippet:', error);
    return NextResponse.json({ error: 'Failed to review snippet' }, { status: 500 });
  }
}