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
import {
  Calculator,
  IndianRupee,
  Calendar,
  Percent,
  Building2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Link } from "react-router-dom";

interface EmiCalculatorProps {
  selectedBikePrice?: number;
}

const bankPartners = [
  {
    name: "State Bank of India",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/cc/SBI-logo.svg",
    rate: "7.50%",
  },
  {
    name: "HDFC Bank",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg",
    rate: "7.75%",
  },
  {
    name: "ICICI Bank",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/12/ICICI_Bank_Logo.svg",
    rate: "7.99%",
  },
  {
    name: "Axis Bank",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Axis_Bank_logo.svg",
    rate: "8.25%",
  },
  {
    name: "Kotak Mahindra Bank",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/41/Kotak_Mahindra_Bank_logo.svg",
    rate: "8.50%",
  },
  {
    name: "IndusInd Bank",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6b/IndusInd_Bank_Logo.svg",
    rate: "8.75%",
  },
  {
    name: "Yes Bank",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/47/YES_BANK_Logo.svg",
    rate: "9.00%",
  },
  {
    name: "Bank of Baroda",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Bank_of_Baroda_logo.svg",
    rate: "8.30%",
  },
];

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

    const emiValue =
      (principal * ratePerMonth * Math.pow(1 + ratePerMonth, numPayments)) /
      (Math.pow(1 + ratePerMonth, numPayments) - 1);

    setEmi(emiValue);
    setTotalAmount(emiValue * numPayments);
    setTotalInterest(emiValue * numPayments - principal);
  }, [bikePrice, downPayment, loanTerm, interestRate]);

  useEffect(() => {
    calculateEmi();
  }, [calculateEmi]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const selectBankRate = (rate: string) => {
    setInterestRate(parseFloat(rate.replace("%", "")));
  };

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

        {/* Bank Partners Section */}
        <motion.div
          className='mb-12'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card>
            <CardHeader className='text-center'>
              <CardTitle className='flex items-center justify-center gap-2'>
                <Building2 className='h-5 w-5 text-red-600' />
                Our Bank Partners
              </CardTitle>
              <CardDescription>
                Click on any bank to use their interest rate in the calculator
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4'>
                {bankPartners.map((bank, index) => (
                  <motion.div
                    key={bank.name}
                    className='flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-lg hover:border-red-200 transition-all duration-300 cursor-pointer group'
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => selectBankRate(bank.rate)}
                  >
                    <div className='w-14 h-14 mb-2 flex items-center justify-center bg-gray-50 rounded-lg group-hover:bg-red-50 transition-colors'>
                      <img
                        src={bank.logo}
                        alt={`${bank.name} logo`}
                        className='max-w-10 max-h-10 object-contain'
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="text-xs font-medium text-gray-600 text-center">${
                              bank.name.split(" ")[0]
                            }</div>`;
                          }
                        }}
                      />
                    </div>
                    <h3 className='text-xs font-medium text-center mb-1 text-gray-900 leading-tight'>
                      {bank.name}
                    </h3>
                    <div className='text-xs text-center'>
                      <span className='text-green-600 font-medium block'>
                        From
                      </span>
                      <div className='text-red-600 font-bold'>{bank.rate}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className='grid grid-cols-1 lg:grid-cols-2 gap-8'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
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
              <br />

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
              <br />
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
              <br />

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
                <Button asChild className='bg-red-600 hover:bg-red-700'>
                  <Link to='/finance'>Apply for Financing</Link>
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
