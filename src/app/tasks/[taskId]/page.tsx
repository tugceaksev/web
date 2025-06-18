import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import TaskDetailView from './TaskDetailView';

export default async function TaskDetailPage({ params }: { params: { taskId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const task = await prisma.task.findUnique({
    where: {
      id: params.taskId,
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
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-2xl rounded-lg bg-card p-6 shadow-lg">
          <h1 className="text-2xl font-bold text-card-foreground">Task Not Found</h1>
          <p className="mt-4 text-card-foreground">The requested task could not be found.</p>
        </div>
      </div>
    );
  }

  return <TaskDetailView task={task} />;
} 