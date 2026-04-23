import { PageShell, EmptyState } from '../../components/ui';

export default function GuestList() {
  return (
    <PageShell title="Guest List" subtitle="Manage your event RSVPs and guest details.">
      <EmptyState 
        title="Guest List Coming Soon" 
        description="This feature is part of the next phase of development. You will be able to add and manage your guests here." 
      />
    </PageShell>
  );
}
