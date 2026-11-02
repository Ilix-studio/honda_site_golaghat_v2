import { MetricTile } from "./StatCard";
import { motion } from "framer-motion";
import { compactInr, inr } from "@/mainComponents/DataImport/SalesKpiCharts";

import {
  useGetCSVStockAssignStatsQuery,
  useGetStockInvestmentTimeseriesQuery,
} from "@/redux-store/services/BikeSystemApi3/csvStockApi";
import {
  useGetStockAssignStatsQuery,
  useGetStockStatusSummaryQuery,
} from "@/redux-store/services/BikeSystemApi2/StockConceptApi";
import { useGetSalesReportKpisQuery } from "@/redux-store/services/salesReportApi";
import { useGetPartsStockStatusQuery } from "@/redux-store/services/partsApi";
import { useGetServiceInvoiceStatsQuery } from "@/redux-store/services/serviceInvoiceApi";
import { useGetCounterSaleBatchesQuery } from "@/redux-store/services/counterSaleApi";
import { useGetB2BSalesKPIsQuery } from "@/redux-store/services/BikeSystemApi2/b2bSalesApi";

/**
 * Lower bound that covers every import. The server defaults a missing `from`
 * to the trailing 30 days, so the all-time tiles have to pass one explicitly.
 */
const ALL_TIME_FROM = "1970-01-01";

// Colours follow the "Data owned by" badges: Branch Admin purple, Parts Admin
// amber, Service Admin green.
const REVENUE_TONES = {
  vehicle: {
    box: "bg-purple-50 border-purple-100",
    label: "text-purple-500",
    value: "text-purple-700",
    rule: "border-purple-200",
  },
  parts: {
    box: "bg-amber-50 border-amber-100",
    label: "text-amber-600",
    value: "text-amber-700",
    rule: "border-amber-200",
  },
  service: {
    box: "bg-green-50 border-green-100",
    label: "text-green-600",
    value: "text-green-700",
    rule: "border-green-200",
  },
} as const;

type RevenueTone = keyof typeof REVENUE_TONES;

function RevenuePart({
  label,
  value,
  tone,
  strong,
  nested,
}: {
  label: string;
  value: number;
  tone: RevenueTone;
  strong?: boolean;
  nested?: boolean;
}) {
  const t = REVENUE_TONES[tone];
  return (
    <div className={nested ? `pl-2 border-l-2 ${t.rule}` : ""}>
      <p
        className={`text-[11px] font-semibold uppercase tracking-wider ${t.label}`}
      >
        {label}
      </p>
      <p
        className={`tabular-nums ${t.value} ${strong ? "text-lg font-bold" : "text-sm font-medium"}`}
      >
        {compactInr(value)}
      </p>
    </div>
  );
}

/**
 * Daily (or weekly/monthly) Stock Investment KPI block: how much cost price
 * has gone into incoming CSV stock, and how it's tracking against sales +
 * VAS + parts revenue from the same batches. Mirrors PartsKpiCharts.tsx's
 * shadcn chart set for visual consistency across the Super-Admin
 * dashboard.
 */
export default function StockInvestmentKpiCharts() {
  /** 0 = trailing 30 days (the server default), 1–12 = that month of this year. */

  const { data: stockAssignStats } = useGetStockAssignStatsQuery({});
  const { data: csvStockAssignStats } = useGetCSVStockAssignStatsQuery({
    year: new Date().getFullYear(),
  });

  const { data: salesReportKpis } = useGetSalesReportKpisQuery();
  const { data: b2b } = useGetB2BSalesKPIsQuery();
  const { data: statusSummary } = useGetStockStatusSummaryQuery();
  const { data: serviceStats } = useGetServiceInvoiceStatsQuery();
  const { data: counterSale } = useGetCounterSaleBatchesQuery();
  const { data: partsStatus } = useGetPartsStockStatusQuery();

  // The tiles ignore the chart's granularity and month window: like Not Sold
  // and Total Sold they count every import, so an older batch never drops out
  // of the investment total. Year buckets keep the response to a few points.
  const { data: allTime } = useGetStockInvestmentTimeseriesQuery({
    granularity: "year",
    from: ALL_TIME_FROM,
  });

  const totals = allTime?.data.totals;

  const manualStockAssignRevenue =
    stockAssignStats?.data.totals.totalRevenue ?? 0;
  const csvStockAssignRevenue =
    csvStockAssignStats?.data.totals.totalRevenue ?? 0;
  const salesReportRevenue = salesReportKpis?.data.totals.totalPayment ?? 0;
  const challanRevenue = b2b?.data.totalPayableValue ?? 0;

  // Vehicle revenue has three sources: stock assigned from CSV uploads (plus
  // manual assignment), B2B challans, and the Branch-Admin's sales report.
  const stockVehicleRevenue = manualStockAssignRevenue + csvStockAssignRevenue;
  const vehicleRevenue =
    stockVehicleRevenue + challanRevenue + salesReportRevenue;
  // Parts revenue has two sources: parts and lubes sold on service invoices,
  // and counter sales (CPTOS). Parts stock value is investment, not revenue.
  // The invoice total already contains the parts, so Service is the remainder
  // and the figures never double count.
  const invoiceTotals = serviceStats?.data.totals;
  const partsFromServiceRevenue =
    (invoiceTotals?.partsRevenue ?? 0) + (invoiceTotals?.lubesRevenue ?? 0);
  const partsFromCptosRevenue = (counterSale?.data ?? []).reduce(
    (sum, b) => sum + b.totalInvoice,
    0,
  );
  const partsRevenue = partsFromServiceRevenue + partsFromCptosRevenue;
  const serviceRevenue =
    (invoiceTotals?.totalRevenue ?? 0) - partsFromServiceRevenue;

  const totalRevenue = vehicleRevenue + partsRevenue + serviceRevenue;

  // Vehicle + parts investment minus revenue: positive means there is still
  // investment to recover, negative means revenue has passed it.
  const stockInvestmentAmount = totals?.totalCostPrice ?? 0;
  const partsInvestmentAmount = Math.round(partsStatus?.data.totalRevenue ?? 0);
  const totalInvestment = stockInvestmentAmount + partsInvestmentAmount;
  const investmentGap = Math.round(totalInvestment - totalRevenue);

  // Vehicles whose stock row is flagged "Sold". Challan sales are already in
  // here — creating a challan flips the stock row — so the challan tile below
  // is a breakdown of this number, never something to add to it.
  const soldInStock = statusSummary?.data.combined.sold ?? 0;

  // Sales-report rows whose vehicle exists in no stock collection. Nothing was
  // flipped to "Sold" because there was no row to flip, so these are real
  // sales that the stock counts alone can never show. Disjoint from
  // `soldInStock` by construction (they matched no stock row), which is what
  // makes adding them safe: a row that DID match is reflected in soldInStock
  // instead and is excluded here.
  const soldWithoutStock = salesReportKpis?.data.totals.salesWithoutStock ?? 0;

  const totalSold = soldInStock + soldWithoutStock;

  // Challan vehicles are already inside `soldInStock`; splitting them out
  // changes how the total is shown, not what it adds up to.
  const challanVehicles = Math.min(b2b?.data.totalVehicles ?? 0, soldInStock);
  const stockOnlySold = soldInStock - challanVehicles;

  // Sold vehicles whose stock row was found but never flipped — still counted
  // as available stock, so "Not Sold" is overstated by this much.
  const staleStockRows =
    salesReportKpis?.data.totals.matchedStockNotFlipped ?? 0;

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_3.4fr] gap-4 items-start'>
        <div className='space-y-4'>
          <div className='rounded-2xl border border-green-700'>
            <MetricTile
              index={0}
              label='Total Stock Investment'
              packed
              value={inr(totals?.totalCostPrice ?? 0)}
              // Shown for reference only — deliberately not added to the vehicle total.
              note={
                <div className='mt-2 border-t-2 border-dotted border-black pt-3'>
                  <p className='text-[13px] font-semibold uppercase tracking-wider'>
                    Total Parts investment
                  </p>
                  <p className='text-lg font-bold tabular-nums text-gray-900'>
                    {inr(Math.round(partsStatus?.data.totalRevenue ?? 0))}
                  </p>
                </div>
              }
              bg='bg-gray-100'
              text='text-gray-900'
              sub='text-gray-500'
            />
          </div>
          <div>
            <MetricTile
              index={1}
              label='Vehicles Added'
              packed
              value={(totals?.vehicleCount ?? 0).toLocaleString("en-IN")}
              bg='bg-blue-50'
              text='text-blue-700'
              sub='text-blue-500'
            />
          </div>
        </div>
        <div className='space-y-4'>
          <div>
            <MetricTile
              index={3}
              label='Total Sold'
              value={totalSold.toLocaleString("en-IN")}
              note={
                <>
                  {stockOnlySold.toLocaleString("en-IN")} from stock +{" "}
                  {soldWithoutStock.toLocaleString("en-IN")} from sales record +{" "}
                  <span className='font-semibold text-purple-600'>
                    {challanVehicles.toLocaleString("en-IN")} challans
                  </span>
                </>
              }
              bg='bg-emerald-50'
              text='text-emerald-700'
              sub='text-emerald-500'
            />
          </div>
          <div>
            <MetricTile
              index={4}
              label='Not Sold'
              value={(statusSummary?.data.combined.notSold ?? 0).toLocaleString(
                "en-IN",
              )}
              note={
                staleStockRows > 0
                  ? `Includes ${staleStockRows.toLocaleString("en-IN")} sold vehicle(s) whose stock row was never flipped — needs review`
                  : "Stock still on hand"
              }
              bg='bg-amber-50'
              text='text-amber-700'
              sub='text-amber-500'
            />
          </div>
        </div>
        <div className='space-y-4 sm:col-span-2 lg:col-span-1'>
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + 2 * 0.07, duration: 0.4 }}
              className='rounded-2xl bg-gray-100 p-4 sm:p-5 flex flex-col gap-4 min-h-[110px]'
            >
              <div>
                <p className='text-xs font-semibold uppercase tracking-widest text-gray-500'>
                  Total Revenue
                </p>
                <p className='text-2xl sm:text-3xl font-black tabular-nums text-gray-900'>
                  {inr(totalRevenue)}
                </p>
              </div>
              <div className='grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3 border-t border-gray-300 pt-4'>
                <div
                  className={`space-y-2 rounded-xl border p-3 ${REVENUE_TONES.vehicle.box}`}
                >
                  <RevenuePart
                    label='Vehicle'
                    value={vehicleRevenue}
                    tone='vehicle'
                    strong
                  />
                  <RevenuePart
                    label='Stock CSV'
                    value={stockVehicleRevenue}
                    tone='vehicle'
                    nested
                  />
                  <RevenuePart
                    label='B2B Challans'
                    value={challanRevenue}
                    tone='vehicle'
                    nested
                  />
                  <RevenuePart
                    label='Sales report'
                    value={salesReportRevenue}
                    tone='vehicle'
                    nested
                  />
                </div>
                <div
                  className={`space-y-2 rounded-xl border p-3 ${REVENUE_TONES.parts.box}`}
                >
                  <RevenuePart
                    label='Parts'
                    value={partsRevenue}
                    tone='parts'
                    strong
                  />
                  <RevenuePart
                    label='Services'
                    value={partsFromServiceRevenue}
                    tone='parts'
                    nested
                  />
                  <RevenuePart
                    label='CPTOS'
                    value={partsFromCptosRevenue}
                    tone='parts'
                    nested
                  />
                </div>
                <div
                  className={`space-y-2 rounded-xl border p-3 ${REVENUE_TONES.service.box}`}
                >
                  <RevenuePart
                    label='Service'
                    value={serviceRevenue}
                    tone='service'
                    strong
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <div className='sm:col-span-2 lg:col-span-3'>
          <MetricTile
            index={2}
            label='Investment − Revenue'
            packed
            value={`${investmentGap < 0 ? "−" : ""}${inr(Math.abs(investmentGap))}`}
            note={
              <div className='mt-2 space-y-1 border-t-2 border-dotted border-black pt-3 text-sm text-gray-900'>
                {[
                  ["Total Stock Investment", stockInvestmentAmount, "+"],
                  ["Total Parts Investment", partsInvestmentAmount, "+"],
                ].map(([label, amount, sign]) => (
                  <p
                    key={label as string}
                    className='flex justify-between gap-3'
                  >
                    <span>
                      <span className='inline-block w-4 font-bold'>{sign}</span>
                      {label}
                    </span>
                    <span className='tabular-nums'>
                      {inr(amount as number)}
                    </span>
                  </p>
                ))}
                <p className='flex justify-between gap-3 border-t border-gray-400 pt-1 font-semibold'>
                  <span>
                    <span className='inline-block w-4'>=</span>Total Investment
                  </span>
                  <span className='tabular-nums'>{inr(totalInvestment)}</span>
                </p>
                <p className='flex justify-between gap-3'>
                  <span>
                    <span className='inline-block w-4 font-bold'>−</span>Total
                    Revenue
                  </span>
                  <span className='tabular-nums'>{inr(totalRevenue)}</span>
                </p>
                <p className='flex justify-between gap-3 border-t border-gray-400 pt-1 font-bold'>
                  <span>
                    <span className='inline-block w-4'>=</span>
                    {investmentGap > 0
                      ? "Still to recover"
                      : "Revenue is ahead"}
                  </span>
                  <span className='tabular-nums'>
                    {investmentGap < 0 ? "−" : ""}
                    {inr(Math.abs(investmentGap))}
                  </span>
                </p>
              </div>
            }
            bg={investmentGap > 0 ? "bg-red-50" : "bg-green-50"}
            text={investmentGap > 0 ? "text-red-700" : "text-green-700"}
            sub={investmentGap > 0 ? "text-red-500" : "text-green-500"}
          />
        </div>
      </div>
    </div>
  );
}
