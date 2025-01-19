import { createServerClien } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const ADMIN_CODE = process.env.ADMIN_CODE || 'YOUR_ADMIN_CODE';

export async function POST(request: Request) {
  try {
    const { resourceId, action, adminCode } = await request.json();

    if (adminCode !== ADMIN_CODE) {
      return NextResponse.json({ error: 'Invalid admin code' }, { status: 401 });
    }

    const supabase = createServerClien();
    
    const { error } = await supabase
      .from('dev_resources')
      .update({ 
        status: action === 'approved' ? 'approved' : 'rejected'
      })
      .eq('id', resourceId);

    if (error) throw error;
    const { data: pendingResources, error: fetchError } = await supabase
      .from('dev_resources')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    return NextResponse.json({ 
      success: true,
      pendingResources
    });
  } catch (error) {
    console.error('Error reviewing resource:', error);
    return NextResponse.json({ error: 'Failed to review resource' }, { status: 500 });
  }
}