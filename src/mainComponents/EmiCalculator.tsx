import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, IndianRupee, Calendar, Percent } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface EmiCalculatorProps {
  selectedBikePrice?: number;
}

export function EmiCalculator({
  selectedBikePrice = 1200000,
}: EmiCalculatorProps) {
  const [bikePrice, setBikePrice] = useState<number>(selectedBikePrice);
  const [downPayment, setDownPayment] = useState<number>(
    Math.round(selectedBikePrice * 0.2)
  );
  const [loanTerm, setLoanTerm] = useState<number>(36);
  const [interestRate, setInterestRate] = useState<number>(7.99);
  const [emi, setEmi] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  // Memoize the calculateEmi function with useCallback
  const calculateEmi = useCallback((): void => {
    const principal = bikePrice - downPayment;
    const ratePerMonth = interestRate / 100 / 12;
    const numPayments = loanTerm;

    if (principal <= 0 || numPayments <= 0 || ratePerMonth <= 0) {
      setEmi(0);
      setTotalInterest(0);
      setTotalAmount(0);
      return;
    }

    // EMI calculation formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const emiValue =
      (principal * ratePerMonth * Math.pow(1 + ratePerMonth, numPayments)) /
      (Math.pow(1 + ratePerMonth, numPayments) - 1);

    setEmi(emiValue);
    setTotalAmount(emiValue * numPayments);
    setTotalInterest(emiValue * numPayments - principal);
  }, [bikePrice, downPayment, loanTerm, interestRate]); // Add all dependencies

  // Calculate EMI when inputs change
  useEffect(() => {
    calculateEmi();
  }, [calculateEmi]); // Now calculateEmi is the only dependency

  // Format currency in Indian Rupees
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Data for pie chart
  const data = [
    { name: "Principal", value: bikePrice - downPayment },
    { name: "Interest", value: totalInterest },
  ];

  const COLORS = ["#e62020", "#777777"];

  return (
    <section id='finance' className='py-20 bg-gray-50'>
      <div className='container px-4 md:px-6'>
        <motion.div
          className='text-center mb-12'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className='text-3xl font-bold tracking-tight'>
            Finance Your Dream Ride
          </h2>
          <p className='mt-4 text-lg text-muted-foreground max-w-2xl mx-auto'>
            Calculate your monthly payments and explore financing options for
            your new Honda motorcycle
          </p>
        </motion.div>

        <motion.div
          className='grid grid-cols-1 lg:grid-cols-2 gap-8'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Calculator className='h-5 w-5 text-red-600' />
                EMI Calculator
              </CardTitle>
              <CardDescription>
                Adjust the sliders to calculate your monthly payment
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <Label
                    htmlFor='bike-price'
                    className='flex items-center gap-2'
                  >
                    <IndianRupee className='h-4 w-4' />
                    Bike Price
                  </Label>
                  <span className='font-medium'>
                    {formatCurrency(bikePrice)}
                  </span>
                </div>
                <div className='flex items-center gap-4'>
                  <Slider
                    id='bike-price'
                    min={100000}
                    max={2000000}
                    step={10000}
                    value={[bikePrice]}
                    onValueChange={(value: number[]) => setBikePrice(value[0])}
                    className='flex-1'
                  />
                  <Input
                    type='number'
                    value={bikePrice}
                    onChange={(e) => setBikePrice(Number(e.target.value))}
                    className='w-24'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <Label
                    htmlFor='down-payment'
                    className='flex items-center gap-2'
                  >
                    <IndianRupee className='h-4 w-4' />
                    Down Payment
                  </Label>
                  <span className='font-medium'>
                    {formatCurrency(downPayment)}
                  </span>
                </div>
                <div className='flex items-center gap-4'>
                  <Slider
                    id='down-payment'
                    min={0}
                    max={bikePrice * 0.5}
                    step={5000}
                    value={[downPayment]}
                    onValueChange={(value: number[]) =>
                      setDownPayment(value[0])
                    }
                    className='flex-1'
                  />
                  <Input
                    type='number'
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className='w-24'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <Label
                    htmlFor='loan-term'
                    className='flex items-center gap-2'
                  >
                    <Calendar className='h-4 w-4' />
                    Loan Term (months)
                  </Label>
                  <span className='font-medium'>{loanTerm} months</span>
                </div>
                <div className='flex items-center gap-4'>
                  <Slider
                    id='loan-term'
                    min={12}
                    max={84}
                    step={12}
                    value={[loanTerm]}
                    onValueChange={(value: number[]) => setLoanTerm(value[0])}
                    className='flex-1'
                  />
                  <Input
                    type='number'
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                    className='w-24'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <Label
                    htmlFor='interest-rate'
                    className='flex items-center gap-2'
                  >
                    <Percent className='h-4 w-4' />
                    Interest Rate (%)
                  </Label>
                  <span className='font-medium'>{interestRate}%</span>
                </div>
                <div className='flex items-center gap-4'>
                  <Slider
                    id='interest-rate'
                    min={5}
                    max={18}
                    step={0.1}
                    value={[interestRate]}
                    onValueChange={(value: number[]) =>
                      setInterestRate(value[0])
                    }
                    className='flex-1'
                  />
                  <Input
                    type='number'
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className='w-24'
                    step='0.01'
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
              <CardDescription>
                Your estimated monthly payment and breakdown
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='text-center'>
                <div className='text-sm text-muted-foreground'>
                  Monthly Payment
                </div>
                <div className='text-4xl font-bold text-red-600 mt-1'>
                  {formatCurrency(Math.round(emi))}
                </div>
                <div className='text-sm text-muted-foreground mt-1'>
                  for {loanTerm} months
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4 text-center'>
                <div className='p-4 bg-gray-100 rounded-lg'>
                  <div className='text-sm text-muted-foreground'>
                    Loan Amount
                  </div>
                  <div className='text-xl font-semibold mt-1'>
                    {formatCurrency(bikePrice - downPayment)}
                  </div>
                </div>
                <div className='p-4 bg-gray-100 rounded-lg'>
                  <div className='text-sm text-muted-foreground'>
                    Total Interest
                  </div>
                  <div className='text-xl font-semibold mt-1'>
                    {formatCurrency(Math.round(totalInterest))}
                  </div>
                </div>
                <div className='p-4 bg-gray-100 rounded-lg'>
                  <div className='text-sm text-muted-foreground'>
                    Down Payment
                  </div>
                  <div className='text-xl font-semibold mt-1'>
                    {formatCurrency(downPayment)}
                  </div>
                </div>
                <div className='p-4 bg-gray-100 rounded-lg'>
                  <div className='text-sm text-muted-foreground'>
                    Total Payment
                  </div>
                  <div className='text-xl font-semibold mt-1'>
                    {formatCurrency(Math.round(totalAmount) + downPayment)}
                  </div>
                </div>
              </div>

              <div className='h-[200px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={data}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {data.map((_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) =>
                        formatCurrency(Math.round(Number(value)))
                      }
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className='flex flex-col gap-2'>
                <Button className='bg-red-600 hover:bg-red-700'>
                  Apply for Financing
                </Button>
                <Button variant='outline'>Download Payment Schedule</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
