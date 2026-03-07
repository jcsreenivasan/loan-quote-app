import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/quotes — list the org's quotes (most recent first)
export async function GET() {
  const { orgId, userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const organizationId = orgId ?? userId

  const quotes = await prisma.quote.findMany({
    where: { organizationId },
    orderBy: { updatedAt: 'desc' },
    take: 20,
  })

  return NextResponse.json(quotes)
}

// POST /api/quotes — create a new quote for the org
export async function POST(req: Request) {
  const { orgId, userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const organizationId = orgId ?? userId
  const body = await req.json()

  const quote = await prisma.quote.create({
    data: {
      organizationId,
      data: body.data,
    },
  })

  return NextResponse.json(quote, { status: 201 })
}
