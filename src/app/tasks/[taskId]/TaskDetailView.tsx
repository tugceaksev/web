'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Task, TaskStatus } from '@prisma/client';
import { useSession } from 'next-auth/react';

interface TaskWithUser extends Task {
  user: {
    name: string | null;
    email: string | null;
  };
}

interface Props {
  task: TaskWithUser;
}

export default function TaskDetailView({ task }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete task');
      
      router.push('/tasks');
      router.refresh();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          status,
        }),
      });

      if (!response.ok) throw new Error('Failed to update task');
      
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl rounded-lg bg-card p-6 shadow-lg">
        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-card-foreground">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-card-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-card-foreground">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-card-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-card-foreground">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-card-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-md border border-input px-4 py-2 text-sm font-medium text-card-foreground hover:bg-background/80"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-card-foreground">{task.title}</h1>
              <div className="space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                  disabled={isLoading}
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-md bg-danger px-4 py-2 text-sm font-medium text-white hover:bg-danger/80"
                  disabled={isLoading}
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm font-medium text-card-foreground">Status</p>
              <p className="mt-1 text-card-foreground">
                {status === 'PENDING' ? 'Pending' : 
                 status === 'IN_PROGRESS' ? 'In Progress' : 
                 status === 'COMPLETED' ? 'Completed' : 'Cancelled'}
              </p>
            </div>
            
            {task.description && (
              <div className="mt-4">
                <p className="text-sm font-medium text-card-foreground">Description</p>
                <p className="mt-1 whitespace-pre-wrap text-card-foreground">{task.description}</p>
              </div>
            )}
            
            <div className="mt-4">
              <p className="text-sm font-medium text-card-foreground">Created by</p>
              <p className="mt-1 text-card-foreground">{task.user.name || task.user.email}</p>
            </div>
            
            <div className="mt-4">
              <p className="text-sm font-medium text-card-foreground">Created at</p>
              <p className="mt-1 text-card-foreground">
                {new Date(task.createdAt).toLocaleString()}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 