import { CreateOrganizationForm } from '@/components/organization/create-organization-form';

export default function CreateOrganizationPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto">
        <CreateOrganizationForm />
      </div>
    </div>
  );
}