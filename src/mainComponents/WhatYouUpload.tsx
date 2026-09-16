import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BRANCH_COLUMN_CENTERS,
  UPLOAD_OWNERSHIP,
} from "./Admin/AdminDash/SuperOverviewKpiCharts";

const WhatYouUpload = () => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Who Uploads What</CardTitle>
          <CardDescription>
            Every number above traces back to one of these uploads, and to the
            role that owns it
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center'>
            <div className='rounded-lg border-2 border-gray-900 px-4 py-2 text-center'>
              <p className='text-sm font-semibold text-gray-900'>Super-Admin</p>
              <p className='text-xs text-muted-foreground'>
                Reads all branches
              </p>
            </div>

            <div className='h-6 w-px bg-border lg:hidden' aria-hidden='true' />
            <div
              className='relative hidden h-6 w-full lg:block'
              aria-hidden='true'
            >
              <div className='absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-border' />
              <div
                className='absolute top-3 h-px bg-border'
                style={{
                  left: BRANCH_COLUMN_CENTERS[0],
                  right: BRANCH_COLUMN_CENTERS[0],
                }}
              />
              {UPLOAD_OWNERSHIP.map((branch, i) => (
                <div
                  key={branch.role}
                  className='absolute top-3 h-3 w-0.5 -translate-x-1/2'
                  style={{
                    left: BRANCH_COLUMN_CENTERS[i],
                    backgroundColor: branch.color,
                  }}
                />
              ))}
            </div>

            <div className='grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              {UPLOAD_OWNERSHIP.map((branch) => (
                <div
                  key={branch.role}
                  className='rounded-lg border border-l-4 bg-muted/30 p-3'
                  style={{ borderLeftColor: branch.color }}
                >
                  <p className='text-sm font-semibold text-gray-900'>
                    {branch.role}
                  </p>
                  {branch.scope ? (
                    <p className='text-xs text-muted-foreground'>
                      {branch.scope}
                    </p>
                  ) : null}
                  <ul className='mt-2 space-y-1.5'>
                    {branch.owns.map((item) => (
                      <li key={item} className='flex items-center gap-2'>
                        <span
                          className='h-0.5 w-3 shrink-0 rounded-full'
                          style={{ backgroundColor: branch.color }}
                          aria-hidden='true'
                        />
                        <span className='rounded-md border bg-background px-2 py-1 text-xs font-medium text-gray-900'>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Outbound messages — the only group here that leaves the
                      building, so it gets an arrow rather than a bullet or a
                      dashed outline. A `pending` channel is documented but not
                      wired up yet, and says so instead of reading as live. */}
                  {branch.sends?.length ? (
                    <div className='mt-3 border-t border-dashed pt-2'>
                      <p className='text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>
                        Sends SMS to customer
                      </p>
                      <ul className='mt-1.5 space-y-1'>
                        {branch.sends.map((item) => (
                          <li
                            key={item.label}
                            className='flex items-center gap-1.5'
                          >
                            <span
                              className='text-[11px] leading-none text-muted-foreground'
                              aria-hidden='true'
                            >
                              &rarr;
                            </span>
                            <span className='rounded-md border px-2 py-1 text-[11px] font-medium text-gray-900'>
                              {item.label}
                            </span>
                            {item.pending ? (
                              <span className='text-[10px] uppercase tracking-wide text-muted-foreground'>
                                Not wired yet
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {/* Read-only access, deliberately styled apart from the solid
                      chips above: no colour bullet and a dashed outline, so the
                      card never reads as though this role uploaded any of it. */}
                  {branch.reads?.length ? (
                    <div className='mt-3 border-t border-dashed pt-2'>
                      <p className='text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>
                        Can view
                      </p>
                      <ul className='mt-1.5 flex flex-wrap gap-1'>
                        {branch.reads.map((item) => (
                          <li key={item}>
                            <span className='rounded-md border border-dashed px-2 py-1 text-[11px] text-muted-foreground'>
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatYouUpload;
