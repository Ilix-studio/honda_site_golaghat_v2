
import {
  Building2,
  Plus,
  Phone,
  Mail,
  MapPin,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  useGetBranchesQuery,
} from "@/redux-store/services/branchApi";
import { Link } from "react-router-dom";

// ─── Component ────────────────────────────────────────────────────────────────

const BranchManagement: React.FC = () => {

 

  const { data, isLoading, isError } = useGetBranchesQuery();
  

  const branches = data?.data ?? [];




  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="container py-6 space-y-6">
      {/* ── Header Card ─────────────────────────────────────────────────── */}
      <Card className="shadow-md">
        <CardHeader className="bg-muted/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                Branch Management
              </CardTitle>
              <CardDescription>
                View and manage all dealership branches
              </CardDescription>
            </div>

            {/* Add Branch Dialog */}
      <Link to="/admin/branches/add" >
        <Button
        >
         <Plus/> Add Branch
          </Button>
        </Link>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* ── Loading ──────────────────────────────────────────────── */}
          {isLoading && (
            <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading branches…</span>
            </div>
          )}

          {/* ── Error ────────────────────────────────────────────────── */}
          {isError && (
            <div className="flex items-center gap-2 text-destructive py-8 justify-center">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">Failed to load branches.</span>
            </div>
          )}

          {/* ── Empty ────────────────────────────────────────────────── */}
          {!isLoading && !isError && branches.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No branches found. Add one to get started.</p>
            </div>
          )}

          {/* ── Branch Grid ──────────────────────────────────────────── */}
          {!isLoading && !isError && branches.length > 0 && (
            <>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {branches.map((branch) => (
                  <Card
                    key={branch._id}
                    className="border border-border hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                        {branch.branchName}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                      {/* Address */}
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span className="leading-snug">{branch.address}</span>
                      </div>

                      {/* Phone */}
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span>{branch.phone}</span>
                      </div>

                      {/* Email */}
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{branch.email}</span>
                      </div>

                      {/* Hours */}
                      <div className="flex items-start gap-2 pt-1">
                        <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <div className="space-y-0.5">
                          <p>
                            <span className="font-medium text-foreground">Weekdays:</span>{" "}
                            {branch.hours.weekdays}
                          </p>
                          <p>
                            <span className="font-medium text-foreground">Saturday:</span>{" "}
                            {branch.hours.saturday}
                          </p>
                          <p>
                            <span className="font-medium text-foreground">Sunday:</span>{" "}
                            {branch.hours.sunday}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BranchManagement;