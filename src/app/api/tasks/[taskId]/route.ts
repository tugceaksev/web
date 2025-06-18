import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TaskStatus } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in task detail GET:', session);
    
    if (!session?.user?.id) {
      console.log('No session or user ID in task detail GET');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { taskId } = await params;

    // First find the task
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!task) {
      return new NextResponse('Task not found', { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in task DELETE:', session);
    
    if (!session?.user?.id) {
      console.log('No session or user ID in task DELETE');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { taskId } = await params;

    // First find the task to verify ownership
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return new NextResponse('Task not found', { status: 404 });
    }

    // Then delete it
    const task = await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error deleting task:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in task PATCH:', session);
    
    if (!session?.user?.id) {
      console.log('No session or user ID in task PATCH');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { taskId } = await params;

    // First find the task to verify ownership
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return new NextResponse('Task not found', { status: 404 });
    }

    const body = await request.json();
    const { title, description, status } = body;
    console.log('Update task data:', { title, description, status });

    // Then update it
    const task = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        title,
        description,
        status: status as TaskStatus,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 