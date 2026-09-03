import { useMemo, useState } from "react";

import AssignedCustomersTable, {
  type AssignedRow,
} from "./AssignedCustomersTable";
import {
  useGetAssignedStockQuery,
  type AssignedStockItem,
} from "../../../redux-store/services/BikeSystemApi2/StockConceptApi";

const LIMIT = 15;

/** Manually assigned stock (StockConcept) — Branch-Admin assigns one bike at a time. */
const ViewAssignedStock: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useGetAssignedStockQuery({
    page,
    limit: LIMIT,
    search: searchTerm.trim() || undefined,
  });

  const rows: AssignedRow[] = useMemo(
    () =>
      (data?.data ?? []).map((item: AssignedStockItem) => {
        const cv = item.salesInfo?.customerVehicleId;
        const branch = item.stockStatus?.branchId as
          | { branchName?: string }
          | string
          | undefined;

        return {
          id: item._id,
          model: item.modelName,
          modelSubtitle: [item.color, item.yearOfManufacture]
            .filter(Boolean)
            .join(" · "),
          category: item.category,
          stockId: item.stockId,
          engineNumber: item.engineNumber,
          chassisNumber: item.chassisNumber,
          customerProfile: item.customerProfile,
          customerPhone: item.salesInfo?.soldTo?.phoneNumber,
          salesPersonName: item.salesInfo?.salesPerson?.name,
          branchName:
            typeof branch === "object" ? branch?.branchName : undefined,
          soldDate: item.salesInfo?.soldDate
            ? String(item.salesInfo.soldDate)
            : undefined,
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
        title='Manually Assigned Vehicles'
        description='Assigned one-by-one by a Branch-Admin'
        rows={rows}
        total={data?.total ?? 0}
        page={page}
        totalPages={data?.pages ?? 1}
        onPageChange={setPage}
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        searchPlaceholder='Search by stock ID, model, engine, chassis...'
        isLoading={isLoading}
        isError={isError}
        emptyMessage='No manually assigned vehicles found.'
      />
    </div>
  );
};

export default ViewAssignedStock;
