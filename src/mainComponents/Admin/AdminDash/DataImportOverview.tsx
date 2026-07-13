import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useGetSalesTimeseriesQuery,
  useGetDatasetsQuery,
} from "@/redux-store/services/dataImportApi";
import type { Granularity } from "@/redux-store/services/dataImport.types";
import SalesTrendChart from "@/mainComponents/DataImport/SalesTrendChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";

export default function DataImportOverview() {
  const [granularity, setGranularity] = useState<Granularity>("day");

  const { data: salesData, isLoading: salesLoading } = useGetSalesTimeseriesQuery({
    granularity,
  });
  const { data: datasetsData } = useGetDatasetsQuery({ page: 1, limit: 20 });

  const data = salesData?.data;

  return (
    <div className='p-6 md:p-10 space-y-6'>
      <div className='flex items-center justify-between flex-wrap gap-3'>
        <div>
          <h1 className='text-2xl font-black text-gray-900'>
            Sales & Data Import Overview
          </h1>
          <p className='text-sm text-gray-500'>
            Revenue trends across all branches, sourced from imported data.
          </p>
        </div>
        <Link to='/admin/data-import/upload'>
          <Button className='bg-blue-600 hover:bg-blue-700'>
            <UploadCloud className='w-4 h-4 mr-2' />
            Upload Data
          </Button>
        </Link>
      </div>

      <SalesTrendChart
        granularity={granularity}
        onGranularityChange={setGranularity}
        data={data?.timeseries ?? []}
        loading={salesLoading}
      />

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Card className='border border-gray-200 shadow-sm'>
          <CardHeader>
            <CardTitle>Revenue by Model</CardTitle>
          </CardHeader>
          <CardContent>
            {!data?.byModel?.length ? (
              <p className='text-sm text-gray-400'>No data yet.</p>
            ) : (
              <table className='w-full text-sm'>
                <thead className='text-gray-500 text-left'>
                  <tr>
                    <th className='py-2 pr-4'>Model</th>
                    <th className='py-2 pr-4'>Revenue</th>
                    <th className='py-2 pr-4'>Job Cards</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byModel.map((m) => (
                    <tr key={m.modelName} className='border-t border-gray-100'>
                      <td className='py-2 pr-4 font-medium text-gray-800'>
                        {m.modelName || "—"}
                      </td>
                      <td className='py-2 pr-4 tabular-nums'>
                        ₹{m.totalRevenue.toLocaleString("en-IN")}
                      </td>
                      <td className='py-2 pr-4 tabular-nums'>{m.jobCardCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card className='border border-gray-200 shadow-sm'>
          <CardHeader>
            <CardTitle>Revenue by Branch</CardTitle>
          </CardHeader>
          <CardContent>
            {!data?.byBranch?.length ? (
              <p className='text-sm text-gray-400'>No data yet.</p>
            ) : (
              <table className='w-full text-sm'>
                <thead className='text-gray-500 text-left'>
                  <tr>
                    <th className='py-2 pr-4'>Branch</th>
                    <th className='py-2 pr-4'>Revenue</th>
                    <th className='py-2 pr-4'>Job Cards</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byBranch.map((b) => (
                    <tr key={b.branchId} className='border-t border-gray-100'>
                      <td className='py-2 pr-4 font-medium text-gray-800'>
                        {b.branchName || b.branchId}
                      </td>
                      <td className='py-2 pr-4 tabular-nums'>
                        ₹{b.totalRevenue.toLocaleString("en-IN")}
                      </td>
                      <td className='py-2 pr-4 tabular-nums'>{b.jobCardCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className='border border-gray-200 shadow-sm'>
        <CardHeader>
          <CardTitle>Recent Imports</CardTitle>
        </CardHeader>
        <CardContent>
          {!datasetsData?.data?.length ? (
            <p className='text-sm text-gray-400'>No uploads yet.</p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='text-gray-500 text-left'>
                  <tr>
                    <th className='py-2 pr-4'>File</th>
                    <th className='py-2 pr-4'>Dataset</th>
                    <th className='py-2 pr-4'>Rows</th>
                    <th className='py-2 pr-4'>Review</th>
                    <th className='py-2 pr-4'>Status</th>
                    <th className='py-2 pr-4'>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {datasetsData.data.map((d) => (
                    <tr key={d.batchId} className='border-t border-gray-100'>
                      <td className='py-2 pr-4 font-medium text-gray-800'>
                        {d.fileName}
                      </td>
                      <td className='py-2 pr-4 text-gray-500'>{d.datasetType}</td>
                      <td className='py-2 pr-4 tabular-nums'>{d.importedRows}</td>
                      <td className='py-2 pr-4 tabular-nums'>{d.reviewRows}</td>
                      <td className='py-2 pr-4 text-gray-500'>{d.status}</td>
                      <td className='py-2 pr-4 text-gray-500'>
                        {new Date(d.createdAt).toLocaleDateString()}
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
