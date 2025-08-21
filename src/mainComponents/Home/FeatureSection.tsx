import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Shield, Award, Gauge, Clock, Settings } from "lucide-react";

export function FeaturesSection() {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const features = [
    {
      icon: <Zap className='h-8 w-8 text-red-600' />,
      title: "Powerful Performance",
      description:
        "Experience the thrill of Honda's legendary engineering with powerful engines designed for optimal performance.",
    },
    {
      icon: <Shield className='h-8 w-8 text-red-600' />,
      title: "Advanced Safety",
      description:
        "Ride with confidence thanks to Honda's cutting-edge safety features and rider assistance systems.",
    },
    {
      icon: <Award className='h-8 w-8 text-red-600' />,
      title: "Unmatched Reliability",
      description:
        "Honda motorcycles are built to last, with legendary reliability that keeps you on the road for years to come.",
    },
    {
      icon: <Gauge className='h-8 w-8 text-red-600' />,
      title: "Precision Handling",
      description:
        "Experience responsive, precise handling that makes every ride more enjoyable, whether on city streets or winding roads.",
    },
    {
      icon: <Clock className='h-8 w-8 text-red-600' />,
      title: "Fuel Efficiency",
      description:
        "Honda's innovative engine technology delivers excellent fuel economy without sacrificing performance.",
    },
    {
      icon: <Settings className='h-8 w-8 text-red-600' />,
      title: "Customization Options",
      description:
        "Make your Honda truly yours with a wide range of genuine accessories and customization options.",
    },
  ];

  return (
    <section id='features' className='py-12 bg-white'>
      <div className='container px-4 md:px-6'>
        <motion.div
          className='text-center mb-8'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className='text-2xl md:text-3xl font-bold tracking-tight'>
            Honda Engineering Excellence
          </h2>
          <p className='mt-2 text-muted-foreground max-w-2xl mx-auto'>
            Discover what makes Honda motorcycles stand out from the crowd
          </p>
        </motion.div>

        <motion.div
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'
          variants={container}
          initial='hidden'
          whileInView='show'
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={item}>
              <Card className='h-full border-none shadow-sm hover:shadow-md transition-shadow'>
                <CardContent className='p-6'>
                  <div className='mb-4'>{feature.icon}</div>
                  <h3 className='text-lg font-semibold mb-2'>
                    {feature.title}
                  </h3>
                  <p className='text-muted-foreground'>{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
