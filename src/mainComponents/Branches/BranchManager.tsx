import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Users,
  Copy,
  CheckCircle,
  Building2,
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";

// Type definitions
interface Branch {
  _id: string;
  name: string;
  address: string;
}

interface BranchManager {
  _id: string;
  applicationId: string;
  branch: Branch;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface CreatedCredentials {
  applicationId: string;
  password: string;
  branchName: string;
}

// Mock data - replace with actual Redux/API calls
const mockBranches: Branch[] = [
  { _id: "1", name: "Honda Motorcycles Golaghat", address: "Golaghat Town" },
  { _id: "2", name: "Honda Motorcycles Sarupathar", address: "Sarupathar" },
];

const mockBranchManagers: BranchManager[] = [
  {
    _id: "1",
    applicationId: "BM-A1B2-C3D4",
    branch: {
      _id: "1",
      name: "Honda Motorcycles Golaghat",
      address: "Golaghat Town",
    },
    createdBy: { name: "Super Admin", email: "admin@honda.com" },
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    _id: "2",
    applicationId: "BM-E5F6-G7H8",
    branch: {
      _id: "2",
      name: "Honda Motorcycles Sarupathar",
      address: "Sarupathar",
    },
    createdBy: { name: "Super Admin", email: "admin@honda.com" },
    createdAt: "2024-01-20T14:45:00Z",
  },
];

const BranchManager = () => {
  const [branchManagers, setBranchManagers] =
    useState<BranchManager[]>(mockBranchManagers);
  const [branches] = useState<Branch[]>(mockBranches);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [createdCredentials, setCreatedCredentials] =
    useState<CreatedCredentials | null>(null);
  const [showCredentials, setShowCredentials] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Generate random application ID
  const generateApplicationId = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const part1 = Array.from(
      { length: 4 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
    const part2 = Array.from(
      { length: 4 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
    return `BM-${part1}-${part2}`;
  };

  // Generate random password
  const generateRandomPassword = (): string => {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()_+";
    return Array.from(
      { length: 10 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  };

  // Handle create branch manager
  const handleCreateBranchManager = async (): Promise<void> => {
    if (!selectedBranch) return;

    setIsCreating(true);
    try {
      // Generate credentials
      const applicationId = generateApplicationId();
      const password = generateRandomPassword();

      // Find selected branch
      const branch = branches.find((b) => b._id === selectedBranch);
      if (!branch) {
        throw new Error("Branch not found");
      }

      // Create new branch manager (simulate API call)
      const newManager: BranchManager = {
        _id: Date.now().toString(),
        applicationId,
        branch,
        createdBy: { name: "Super Admin", email: "admin@honda.com" },
        createdAt: new Date().toISOString(),
      };

      // Update state
      setBranchManagers((prev) => [...prev, newManager]);

      // Set credentials for display
      setCreatedCredentials({
        applicationId,
        password,
        branchName: branch.name,
      });

      // Reset form
      setSelectedBranch("");
      setIsCreateDialogOpen(false);
      setShowCredentials(true);
    } catch (error) {
      console.error("Error creating branch manager:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle delete branch manager
  const handleDeleteBranchManager = async (
    managerId: string
  ): Promise<void> => {
    try {
      setBranchManagers((prev) => prev.filter((m) => m._id !== managerId));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting branch manager:", error);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (
    text: string,
    field: string
  ): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(""), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // Get available branches (not already assigned)
  const getAvailableBranches = (): Branch[] => {
    const assignedBranchIds = branchManagers.map((m) => m.branch._id);
    return branches.filter((b) => !assignedBranchIds.includes(b._id));
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='container px-4 py-4'>
          <div className='flex items-center gap-4'>
            <Link to='/admin/dashboard'>
              <Button variant='ghost' size='sm'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Branch Managers
              </h1>
              <p className='text-gray-600'>
                Manage branch manager accounts and permissions
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className='container px-4 py-8'>
        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Managers
                </CardTitle>
                <Users className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {branchManagers.length}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Active branch managers
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Available Branches
                </CardTitle>
                <Building2 className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {getAvailableBranches().length}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Branches without managers
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total Branches
                </CardTitle>
                <Building2 className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{branches.length}</div>
                <p className='text-xs text-muted-foreground'>
                  All branch locations
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className='flex justify-between items-center'>
              <div>
                <CardTitle>Branch Managers</CardTitle>
                <CardDescription>
                  Manage branch manager accounts and their access permissions
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className='bg-red-600 hover:bg-red-700'
              >
                <Plus className='h-4 w-4 mr-2' />
                Create Branch Manager
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {branchManagers.length === 0 ? (
              <div className='text-center py-12'>
                <Users className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  No Branch Managers
                </h3>
                <p className='text-gray-600 mb-4'>
                  Create your first branch manager to get started.
                </p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className='bg-red-600 hover:bg-red-700'
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Create Branch Manager
                </Button>
              </div>
            ) : (
              <div className='space-y-4'>
                {branchManagers.map((manager) => (
                  <div
                    key={manager._id}
                    className='border rounded-lg p-4 hover:bg-gray-50 transition-colors'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-3 mb-2'>
                          <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center'>
                            <Users className='h-5 w-5 text-red-600' />
                          </div>
                          <div>
                            <h3 className='font-semibold text-lg'>
                              {manager.applicationId}
                            </h3>
                            <p className='text-sm text-muted-foreground'>
                              Branch Manager
                            </p>
                          </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-3'>
                          <div>
                            <p className='text-sm font-medium text-gray-700'>
                              Branch
                            </p>
                            <p className='text-sm text-gray-600'>
                              {manager.branch.name}
                            </p>
                            <p className='text-xs text-gray-500'>
                              {manager.branch.address}
                            </p>
                          </div>
                          <div>
                            <p className='text-sm font-medium text-gray-700'>
                              Created By
                            </p>
                            <p className='text-sm text-gray-600'>
                              {manager.createdBy.name}
                            </p>
                            <p className='text-xs text-gray-500'>
                              {manager.createdBy.email}
                            </p>
                          </div>
                          <div>
                            <p className='text-sm font-medium text-gray-700'>
                              Created
                            </p>
                            <p className='text-sm text-gray-600'>
                              {formatDate(manager.createdAt)}
                            </p>
                            <div className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 mt-1'>
                              Active
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className='ml-4'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setShowDeleteConfirm(manager._id)}
                          className='text-red-600 hover:text-red-700 hover:bg-red-50'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Dialog */}
        {isCreateDialogOpen && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
            <div className='bg-white rounded-lg p-6 w-full max-w-md'>
              <div className='mb-4'>
                <h2 className='text-xl font-semibold'>
                  Create New Branch Manager
                </h2>
                <p className='text-sm text-gray-600 mt-1'>
                  Create a new branch manager account for a specific branch
                  location.
                </p>
              </div>

              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='branch-select'>Select Branch</Label>
                  <Select
                    value={selectedBranch}
                    onValueChange={setSelectedBranch}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Choose a branch to assign' />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableBranches().map((branch) => (
                        <SelectItem key={branch._id} value={branch._id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getAvailableBranches().length === 0 && (
                    <p className='text-sm text-muted-foreground'>
                      All branches already have assigned managers.
                    </p>
                  )}
                </div>
              </div>

              <div className='flex gap-2 mt-6'>
                <Button
                  variant='outline'
                  onClick={() => setIsCreateDialogOpen(false)}
                  className='flex-1'
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateBranchManager}
                  disabled={!selectedBranch || isCreating}
                  className='bg-red-600 hover:bg-red-700 flex-1'
                >
                  {isCreating ? "Creating..." : "Create Manager"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
            <div className='bg-white rounded-lg p-6 w-full max-w-md'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center'>
                  <AlertTriangle className='h-5 w-5 text-red-600' />
                </div>
                <div>
                  <h2 className='text-xl font-semibold'>
                    Delete Branch Manager
                  </h2>
                  <p className='text-sm text-gray-600'>
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className='text-gray-700 mb-6'>
                Are you sure you want to delete this branch manager account?
                This will revoke all access permissions and cannot be undone.
              </p>

              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setShowDeleteConfirm(null)}
                  className='flex-1'
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDeleteBranchManager(showDeleteConfirm)}
                  className='bg-red-600 hover:bg-red-700 flex-1'
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Credentials Dialog */}
        {showCredentials && createdCredentials && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
            <div className='bg-white rounded-lg p-6 w-full max-w-md'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
                  <CheckCircle className='h-5 w-5 text-green-600' />
                </div>
                <div>
                  <h2 className='text-xl font-semibold'>
                    Manager Created Successfully
                  </h2>
                  <p className='text-sm text-gray-600'>
                    Save these credentials securely
                  </p>
                </div>
              </div>

              <div className='space-y-4'>
                <div className='p-3 bg-green-50 rounded-lg'>
                  <p className='text-sm font-medium text-green-800'>
                    Branch Manager for {createdCredentials.branchName}
                  </p>
                </div>

                <div className='space-y-3'>
                  <div>
                    <Label className='text-sm font-medium'>
                      Application ID
                    </Label>
                    <div className='flex items-center gap-2 mt-1'>
                      <div className='flex-1 p-2 bg-gray-100 rounded font-mono text-sm'>
                        {createdCredentials.applicationId}
                      </div>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          copyToClipboard(
                            createdCredentials.applicationId,
                            "applicationId"
                          )
                        }
                      >
                        {copiedField === "applicationId" ? (
                          <CheckCircle className='h-4 w-4 text-green-500' />
                        ) : (
                          <Copy className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className='text-sm font-medium'>
                      Temporary Password
                    </Label>
                    <div className='flex items-center gap-2 mt-1'>
                      <div className='flex-1 p-2 bg-gray-100 rounded font-mono text-sm relative'>
                        {showPassword
                          ? createdCredentials.password
                          : "••••••••••"}
                        <Button
                          variant='ghost'
                          size='sm'
                          className='absolute right-1 top-1 h-6 w-6 p-0'
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className='h-3 w-3' />
                          ) : (
                            <Eye className='h-3 w-3' />
                          )}
                        </Button>
                      </div>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          copyToClipboard(
                            createdCredentials.password,
                            "password"
                          )
                        }
                      >
                        {copiedField === "password" ? (
                          <CheckCircle className='h-4 w-4 text-green-500' />
                        ) : (
                          <Copy className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className='p-3 bg-blue-50 rounded-lg flex items-start gap-2'>
                  <Info className='h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0' />
                  <p className='text-sm text-blue-800'>
                    <strong>Important:</strong> Please provide these credentials
                    to the branch manager. They should change the password after
                    their first login.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => {
                  setShowCredentials(false);
                  setCreatedCredentials(null);
                  setShowPassword(false);
                }}
                className='w-full mt-6'
              >
                I've Saved the Credentials
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchManager;
