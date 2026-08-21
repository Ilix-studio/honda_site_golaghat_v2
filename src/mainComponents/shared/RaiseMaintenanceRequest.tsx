import { useState } from "react";
import { LifeBuoy, Loader2, Send, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useCreateMaintenanceServiceMutation,
  useDeleteMaintenanceServiceMutation,
  useGetMaintenanceServicesQuery,
  type MaintenancePriority,
  type MaintenanceRecord,
} from "@/redux-store/services/maintenanceApi";
import MaintenanceList from "@/mainComponents/DeveloperM/MaintenanceList";
import { getApiErrorMessage } from "@/lib/apiError";

const PRIORITIES: { value: MaintenancePriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
];

/**
 * "Message the developer" form for Branch-Admin / Service-Admin / Part-Admin.
 * Submitting creates a maintenance service record — there is no separate
 * message log — so the reporter's own requests are listed underneath with the
 * status the Developer has put them in.
 */
export default function RaiseMaintenanceRequest() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<MaintenancePriority>("normal");

  const [createRequest, { isLoading }] = useCreateMaintenanceServiceMutation();
  const [deleteRequest, { isLoading: isDeleting }] =
    useDeleteMaintenanceServiceMutation();
  const { data, isLoading: listLoading } = useGetMaintenanceServicesQuery({
    limit: 50,
  });

  const canSubmit = title.trim() !== "" && description.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      await createRequest({
        title: title.trim(),
        description: description.trim(),
        // Omit entirely rather than sending "" — the server treats a present
        // but unparseable deadline as a client error.
        ...(deadline ? { deadline: new Date(deadline).toISOString() } : {}),
        priority,
      }).unwrap();

      toast.success("Maintenance request sent to the developer");
      setTitle("");
      setDescription("");
      setDeadline("");
      setPriority("normal");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to send request"));
    }
  };

  const handleWithdraw = async (record: MaintenanceRecord) => {
    try {
      await deleteRequest(record._id).unwrap();
      toast.success("Request withdrawn");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to withdraw request"));
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 py-8'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <LifeBuoy className='h-4 w-4' />
              Message the Developer
            </CardTitle>
            <CardDescription>
              Report a bug or request a change. Each message is tracked as a
              maintenance service request.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='maintenance-title'>Title *</Label>
                <Input
                  id='maintenance-title'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='Short summary of the issue or request'
                  maxLength={150}
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='maintenance-description'>Description *</Label>
                <Textarea
                  id='maintenance-description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='What happened, where, and what you expected instead'
                  rows={5}
                  maxLength={5000}
                  required
                />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-1.5'>
                  <Label htmlFor='maintenance-deadline'>
                    Deadline{" "}
                    <span className='text-gray-400 font-normal'>
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id='maintenance-deadline'
                    type='date'
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='maintenance-priority'>Priority</Label>
                  <select
                    id='maintenance-priority'
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as MaintenancePriority)
                    }
                    className='w-full h-9 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className='flex justify-end'>
                <Button type='submit' disabled={!canSubmit || isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className='h-4 w-4 mr-2' />
                      Send request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Your requests</CardTitle>
            <CardDescription>
              Every request you have raised, newest first
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MaintenanceList
              records={data?.data ?? []}
              isLoading={listLoading}
              emptyMessage='You have not raised any maintenance requests yet.'
              renderActions={(record) =>
                // Only while still open — the server rejects deletion once the
                // developer has started, so the button would only ever 409.
                record.status === "open" ? (
                  <Button
                    size='sm'
                    variant='outline'
                    disabled={isDeleting}
                    onClick={() => handleWithdraw(record)}
                    className='text-red-600 border-red-200 hover:bg-red-50'
                  >
                    <Trash2 className='h-3.5 w-3.5 mr-1.5' />
                    Withdraw
                  </Button>
                ) : null
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
