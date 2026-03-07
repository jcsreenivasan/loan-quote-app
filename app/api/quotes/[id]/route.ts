import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/db'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { orgId, userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const organizationId = orgId ?? userId
  const body = await req.json()

  const result = await getPrisma().quote.updateMany({
    where: { id: params.id, organizationId },
    data: { data: body.data },
  })

  if (result.count === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { orgId, userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const organizationId = orgId ?? userId

  await getPrisma().quote.deleteMany({
    where: { id: params.id, organizationId },
  })

  return NextResponse.json({ success: true })
}
