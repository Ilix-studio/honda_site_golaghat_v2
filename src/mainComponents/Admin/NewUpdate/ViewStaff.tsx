import { useMemo, useState } from "react";
import {
  Search,
  Users,
  Phone,
  MapPin,
  Briefcase,
  Building,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  useGetAllStaffQuery,
  type UserListItem,
} from "@/redux-store/services/adminApi";

// ─── Component ───────────────────────────────────────────────────────────────

const ViewStaff: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: staffResponse, isLoading, isError } = useGetAllStaffQuery();

  const staff = staffResponse?.data ?? [];

  const filteredStaff = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return staff;
    return staff.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.position?.toLowerCase().includes(term) ||
        s.phoneNumber.toLowerCase().includes(term) ||
        s.branch?.branchName?.toLowerCase().includes(term) ||
        s.address.toLowerCase().includes(term),
    );
  }, [staff, searchTerm]);

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='p-6'>
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between flex-wrap gap-4'>
              <div className='flex items-center gap-3'>
                <Users className='h-6 w-6 text-muted-foreground' />
                <div>
                  <CardTitle>Staff</CardTitle>
                  <CardDescription>
                    {isLoading
                      ? "Loading..."
                      : `${staff.length} staff member${staff.length !== 1 ? "s" : ""}`}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className='space-y-4'>
            {/* Search */}
            <div className='relative'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                type='search'
                placeholder='Search by name, position, phone, branch, or address...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-8'
              />
            </div>

            {/* States */}
            {isLoading ? (
              <div className='text-center py-10 text-muted-foreground'>
                Loading staff...
              </div>
            ) : isError ? (
              <div className='text-center py-10 text-destructive'>
                Failed to load staff. Please try again.
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className='text-center py-10 text-muted-foreground'>
                {searchTerm ? "No staff match your search." : "No staff found."}
              </div>
            ) : (
              <div className='rounded-md border overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>
                        <span className='flex items-center gap-1'>
                          <Briefcase className='h-3.5 w-3.5' /> Position
                        </span>
                      </TableHead>
                      <TableHead>
                        <span className='flex items-center gap-1'>
                          <Phone className='h-3.5 w-3.5' /> Phone
                        </span>
                      </TableHead>
                      <TableHead>
                        <span className='flex items-center gap-1'>
                          <Building className='h-3.5 w-3.5' /> Branch
                        </span>
                      </TableHead>
                      <TableHead className='hidden md:table-cell'>
                        <span className='flex items-center gap-1'>
                          <MapPin className='h-3.5 w-3.5' /> Address
                        </span>
                      </TableHead>
                      <TableHead className='hidden sm:table-cell'>
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((s: UserListItem) => (
                      <TableRow key={s._id}>
                        <TableCell className='font-medium'>{s.name}</TableCell>
                        <TableCell>
                          {s.position ? (
                            <span className='text-sm'>{s.position}</span>
                          ) : (
                            <span className='text-muted-foreground text-sm'>
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className='text-sm'>
                          {s.phoneNumber}
                        </TableCell>
                        <TableCell className='text-sm'>
                          {s.branch?.branchName ?? (
                            <span className='text-muted-foreground'>—</span>
                          )}
                        </TableCell>
                        <TableCell className='hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate'>
                          {s.address}
                        </TableCell>
                        <TableCell className='hidden sm:table-cell'>
                          <Badge variant={s.isActive ? "default" : "secondary"}>
                            {s.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewStaff;
