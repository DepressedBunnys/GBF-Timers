import { useRouter } from 'next/navigation';

export default function TaskPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <div>
      <h1>Hello World</h1>
      <p>Task ID: {id}</p>
    </div>
  );
}
