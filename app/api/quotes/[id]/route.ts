import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// PUT /api/quotes/[id] — update a quote (org-scoped for security)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { orgId, userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const organizationId = orgId ?? userId
  const body = await req.json()

  // updateMany with organizationId prevents cross-org data access
  const result = await prisma.quote.updateMany({
    where: { id: params.id, organizationId },
    data: { data: body.data },
  })

  if (result.count === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}

// DELETE /api/quotes/[id] — delete a quote (org-scoped)
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { orgId, userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const organizationId = orgId ?? userId

  await prisma.quote.deleteMany({
    where: { id: params.id, organizationId },
  })

  return NextResponse.json({ success: true })
}
