import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  useGetSalesTimeseriesQuery,
  useGetDatasetsQuery,
  useGetDatasetRowsQuery,
} from "@/redux-store/services/dataImportApi";
import type { Granularity } from "@/redux-store/services/dataImport.types";
import SalesTrendChart from "@/mainComponents/DataImport/SalesTrendChart";
import {
  StatCard,
  type StatCardProps,
} from "@/mainComponents/Admin/AdminDash/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bike, Wallet, UploadCloud } from "lucide-react";

export default function BranchDataImportDashboard() {
  const [granularity, setGranularity] = useState<Granularity>("day");

  const { data: salesData, isLoading: salesLoading } =
    useGetSalesTimeseriesQuery({
      granularity,
    });

  const { data: vehicleBatches, isLoading: batchesLoading } =
    useGetDatasetsQuery({
      datasetType: "vehicle-stock",
      page: 1,
      limit: 1,
    });

  const latestBatchId = vehicleBatches?.data?.[0]?.batchId;

  const { data: vehicleRows, isLoading: rowsLoading } = useGetDatasetRowsQuery(
    { batchId: latestBatchId as string, page: 1, limit: 500 },
    { skip: !latestBatchId }
  );

  const stockKpis = useMemo(() => {
    const rows = vehicleRows?.data ?? [];
    const totalVehicles = rows.length;
    const totalCostValue = rows.reduce(
      (sum, r) => sum + (Number(r.normalized?.costPrice) || 0),
      0
    );
    return { totalVehicles, totalCostValue };
  }, [vehicleRows]);

  const kpis: Omit<StatCardProps, "index">[] = [
    {
      title: "Vehicles In Stock",
      value: batchesLoading || rowsLoading ? "—" : stockKpis.totalVehicles,
      icon: Bike,
      loading: batchesLoading || rowsLoading,
      description: latestBatchId
        ? `From batch ${latestBatchId}`
        : "No stock import yet",
      action: {
        label: "Upload stock file",
        href: "/manager/data-import/upload",
      },
    },
    {
      title: "Stock Cost Value",
      value:
        batchesLoading || rowsLoading
          ? "—"
          : `₹${stockKpis.totalCostValue.toLocaleString("en-IN")}`,
      icon: Wallet,
      loading: batchesLoading || rowsLoading,
      description: "Sum of cost price, latest batch",
      action: {
        label: "Upload stock file",
        href: "/manager/data-import/upload",
      },
    },
  ];

  return (
    <div className='p-6 md:p-10 space-y-6'>
      <div className='flex items-center justify-between flex-wrap gap-3'>
        <div>
          <h1 className='text-2xl font-black text-gray-900'>
            Branch Sales & Stock
          </h1>
          <p className='text-sm text-gray-500'>
            Sales trend and vehicle stock status for your branch.
          </p>
        </div>
        <Link to='/manager/data-import/upload'>
          <Button className='bg-blue-600 hover:bg-blue-700'>
            <UploadCloud className='w-4 h-4 mr-2' />
            Upload Data
          </Button>
        </Link>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {kpis.map((kpi, i) => (
          <StatCard key={kpi.title} {...kpi} index={i} />
        ))}
      </div>

      <SalesTrendChart
        granularity={granularity}
        onGranularityChange={setGranularity}
        data={salesData?.data?.timeseries ?? []}
        loading={salesLoading}
      />

      <Card size='sm' className='border border-gray-200 shadow-sm'>
        <CardHeader>
          <CardTitle>Latest Vehicle Stock Batch</CardTitle>
        </CardHeader>
        <CardContent>
          {!vehicleRows?.data?.length ? (
            <p className='text-sm text-gray-400'>
              No vehicle stock imported yet.
            </p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='text-gray-500 text-left'>
                  <tr>
                    <th className='py-2 pr-4'>Model</th>
                    <th className='py-2 pr-4'>Color</th>
                    <th className='py-2 pr-4'>Frame Number</th>
                    <th className='py-2 pr-4'>Location</th>
                    <th className='py-2 pr-4'>Cost Price</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleRows.data.slice(0, 20).map((r) => (
                    <tr key={r._id} className='border-t border-gray-100'>
                      <td className='py-2 pr-4 font-medium text-gray-800'>
                        {r.normalized?.modelVariant || "—"}
                      </td>
                      <td className='py-2 pr-4 text-gray-500'>
                        {r.normalized?.color || "—"}
                      </td>
                      <td className='py-2 pr-4 text-gray-500'>
                        {r.normalized?.frameNumber || "—"}
                      </td>
                      <td className='py-2 pr-4 text-gray-500'>
                        {r.normalized?.location || "—"}
                      </td>
                      <td className='py-2 pr-4 tabular-nums'>
                        {r.normalized?.costPrice
                          ? `₹${Number(r.normalized.costPrice).toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
