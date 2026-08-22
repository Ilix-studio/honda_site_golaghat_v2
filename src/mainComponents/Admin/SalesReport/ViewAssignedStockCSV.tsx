import { useMemo, useState } from "react";

import AssignedCustomersTable, {
  type AssignedRow,
} from "./AssignedCustomersTable";
import {
  useGetAssignedCSVStockQuery,
  type AssignedCSVStockItem,
} from "@/redux-store/services/BikeSystemApi3/csvStockApi";

const LIMIT = 15;

/**
 * Stock that arrived via a CSV import (StockConceptCSV) and was then assigned
 * to a customer. Same presentation as the manual tab — the two models just name
 * their fields differently, so the mapping below normalizes them.
 */
const ViewAssignedStockCSV: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useGetAssignedCSVStockQuery({
    page,
    limit: LIMIT,
    search: searchTerm.trim() || undefined,
  });

  const rows: AssignedRow[] = useMemo(
    () =>
      (data?.data ?? []).map((item: AssignedCSVStockItem) => {
        const cv = item.salesInfo?.customerVehicleId;
        const branch = item.stockStatus?.branchId;

        return {
          id: item._id,
          model: item.modelVariant,
          modelSubtitle: [item.color, item.stockId].filter(Boolean).join(" · "),
          stockId: item.stockId,
          engineNumber: item.engineNumber,
          chassisNumber: item.frameNumber,
          sourceLabel: item.csvFileName,
          customerProfile: item.customerProfile,
          customerPhone: item.salesInfo?.soldTo?.phoneNumber,
          branchName:
            typeof branch === "object" ? branch?.branchName : undefined,
          soldDate: item.salesInfo?.soldDate,
          salePrice: item.salesInfo?.salePrice,
          invoiceNumber: item.salesInfo?.invoiceNumber,
          paymentStatus: item.salesInfo?.paymentStatus,
          vehicle: cv
            ? {
                numberPlate: cv.numberPlate,
                registeredOwnerName: cv.registeredOwnerName,
                registrationDate: cv.registrationDate,
                isPaid: cv.isPaid,
                isFinance: cv.isFinance,
                insurance: cv.insurance,
              }
            : undefined,
        };
      }),
    [data],
  );

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  return (
    <div className='p-4 sm:p-6'>
      <AssignedCustomersTable
        title='CSV-Assigned Vehicles'
        description='Imported by CSV, then assigned to a customer'
        rows={rows}
        total={data?.total ?? 0}
        page={page}
        totalPages={data?.pages ?? 1}
        onPageChange={setPage}
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        searchPlaceholder='Search by stock ID, model, engine, frame, invoice...'
        isLoading={isLoading}
        isError={isError}
        emptyMessage='No CSV-assigned vehicles found.'
      />
    </div>
  );
};

export default ViewAssignedStockCSV;
