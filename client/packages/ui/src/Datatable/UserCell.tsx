import { Avatar } from "../components/avatar";

export interface UserCellProps {
  name: string;

  email: string;

  id?: string;

  image?: string | null;

  subtitle?: string;
}

export function UserCell({
  name,
  email,
  id,
  image,
  subtitle,
}: UserCellProps) {
  return (
    
    <div className="flex items-center gap-3">
      <Avatar
      
        src={image ?? undefined}
        
        
        size="md"
      />

      <div className="min-w-0">
        <p className="truncate font-medium text-gray-900">
          {name}
        </p>

        {id && (
          <p className="text-xs text-gray-500">
            {id}
          </p>
        )}

        <p className="truncate text-sm text-gray-500">
          {subtitle ?? email}
        </p>
      </div>
    </div>
  );
}