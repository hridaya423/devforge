import { createServerClien } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { vote_type } = await request.json();
    const supabase = createServerClien();
    const { error: voteError } = await supabase
      .from('snippet_votes')
      .insert([{
        snippet_id: params.id,
        vote_type
      }]);

    if (voteError) throw voteError;
    const { error: updateError } = await supabase.rpc('update_vote_count', {
      p_snippet_id: params.id,
      p_vote_type: vote_type
    });

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error voting:', error);
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }
}
