import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // must be set in Vercel
)

export async function POST(req: Request) {
  try {
    const { email, password, name, screens } = await req.json()

    // 1️⃣ Create Auth user
    const { data: user, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // 2️⃣ Insert into your public users table
    const { error: dbError } = await supabaseAdmin.from('users').insert([
      { id: user.user.id, email, name, screens },
    ])

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API create-user error:', error)
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}
