// ListLeave.tsx

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";

import {
  useGetAllLeavesQuery,
  type LeaveApplication,
} from "@/redux-store/services/NewFeatures/leaveApi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserLeaveRow {
  applicantId: string;
  name: string;
  applicationId: string;
  role: string;
  sickTotal: number;
  casualTotal: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_BADGE: Record<string, string> = {
  "Branch-Admin": "bg-blue-100 text-blue-800 border-blue-200",
  "Service-Admin": "bg-purple-100 text-purple-800 border-purple-200",
  Staff: "bg-gray-100 text-gray-700 border-gray-200",
};

function aggregateByUser(leaves: LeaveApplication[]): UserLeaveRow[] {
  const map = new Map<string, UserLeaveRow>();

  for (const leave of leaves) {
    // Only count approved leaves — pending/rejected/cancelled don't consume balance
    if (leave.status !== "Approved") continue;

    const applicant = leave.applicantId;
    // Backend populates applicantId; guard against string fallback
    if (typeof applicant !== "object" || applicant === null) continue;

    const key = applicant._id;

    if (!map.has(key)) {
      map.set(key, {
        applicantId: key,
        name: applicant.name,
        applicationId: applicant.applicationId,
        role: leave.applicantRole,
        sickTotal: 0,
        casualTotal: 0,
      });
    }

    const row = map.get(key)!;
    if (leave.leaveType === "Sick") row.sickTotal += leave.totalDays;
    if (leave.leaveType === "Casual") row.casualTotal += leave.totalDays;
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ListLeave() {
  const [search, setSearch] = useState("");

  // Fetch all approved leaves in one shot — no pagination needed for aggregation
  const { data, isLoading } = useGetAllLeavesQuery({
    status: "Approved",
    limit: 1000,
    year: new Date().getFullYear(),
  });

  const rows = useMemo(() => aggregateByUser(data?.data ?? []), [data]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.applicationId.toLowerCase().includes(term) ||
        r.role.toLowerCase().includes(term),
    );
  }, [rows, search]);

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-indigo-50 rounded-lg'>
              <Users className='h-5 w-5 text-indigo-600' />
            </div>
            <div>
              <CardTitle className='text-base'>Leave Summary</CardTitle>
              <p className='text-sm text-gray-500 mt-0.5'>
                Approved leave totals per user — {new Date().getFullYear()}
              </p>
            </div>
          </div>

          <div className='relative w-64'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              placeholder='Search name or ID...'
              className='pl-9 h-9'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        {isLoading ? (
          <div className='py-12 text-center text-sm text-gray-500'>
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className='py-12 text-center text-sm text-gray-500'>
            No approved leave records found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className='text-center'>SL (days)</TableHead>
                <TableHead className='text-center'>CL (days)</TableHead>
                <TableHead className='text-center'>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.applicantId}>
                  <TableCell className='font-medium text-gray-800'>
                    {row.name}
                  </TableCell>
                  <TableCell className='text-sm text-gray-500 font-mono'>
                    {row.applicationId}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant='outline'
                      className={`text-xs ${ROLE_BADGE[row.role] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {row.role}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-center tabular-nums'>
                    {row.sickTotal > 0 ? (
                      <span className='text-orange-600 font-medium'>
                        {row.sickTotal}
                      </span>
                    ) : (
                      <span className='text-gray-300'>—</span>
                    )}
                  </TableCell>
                  <TableCell className='text-center tabular-nums'>
                    {row.casualTotal > 0 ? (
                      <span className='text-blue-600 font-medium'>
                        {row.casualTotal}
                      </span>
                    ) : (
                      <span className='text-gray-300'>—</span>
                    )}
                  </TableCell>
                  <TableCell className='text-center tabular-nums font-semibold text-gray-800'>
                    {row.sickTotal + row.casualTotal}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
