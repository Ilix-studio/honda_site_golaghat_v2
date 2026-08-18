import { MetricTile } from "@/mainComponents/Admin/AdminDash/StatCard";
import type { B2BSalesKPIs } from "@/types/b2bSales/b2bSales.types";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

interface B2BSalesKPICardsProps {
  kpis?: B2BSalesKPIs;
  loading?: boolean;
}

const B2BSalesKPICards = ({ kpis, loading }: B2BSalesKPICardsProps) => {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
      <MetricTile
        index={0}
        label='Total Challans'
        value={loading ? "—" : (kpis?.totalChallans ?? 0)}
        bg='bg-gray-900'
        text='text-white'
        sub='text-gray-300'
      />
      <MetricTile
        index={1}
        label='Total Sales Value'
        value={loading ? "—" : inr(kpis?.totalSalesValue ?? 0)}
        bg='bg-blue-50'
        text='text-blue-900'
        sub='text-blue-600'
      />
      <MetricTile
        index={2}
        label='Total Final Value'
        value={loading ? "—" : inr(kpis?.totalPayableValue ?? 0)}
        bg='bg-emerald-50'
        text='text-emerald-900'
        sub='text-emerald-600'
      />
      <MetricTile
        index={3}
        label='Average Challan Value'
        value={loading ? "—" : inr(kpis?.averageChallanValue ?? 0)}
        bg='bg-amber-50'
        text='text-amber-900'
        sub='text-amber-600'
      />
    </div>
  );
};

export default B2BSalesKPICards;
