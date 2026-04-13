
import { Info, Star, MoreVertical, Heart, Share, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";


export default function GoogleReviews() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 bg-white dark:bg-card rounded-lg">
            <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='text-center mb-12'
        >
          <div className='flex items-center justify-center gap-2 mb-4'>
            <div className='h-1 w-12 bg-red-500 rounded-full' />
            <span className='text-red-600 text-sm font-semibold tracking-[0.2em] uppercase'>
              Testimonials
            </span>
            <div className='h-1 w-12 bg-red-500 rounded-full' />
          </div>
          <h2 className='text-3xl md:text-4xl font-bold tracking-tight mb-4'>
            What Our Customers
            <span className='bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent ml-2'>
              Are Saying
            </span>
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Read authentic reviews from our valued customers about their
            experiences at TsangPool Honda
          </p>
        </motion.div>
      <h2 className="text-2xl font-normal text-gray-900 dark:text-gray-100 mb-6">Reviews</h2>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">Google review summary</h3>
          <Info className="w-4 h-4 text-gray-500" />
        </div>
        <Button asChild variant="outline" className="bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100">
          <a href="https://www.google.com/search?sca_esv=ca0ac730e1a720b1&sxsrf=ANbL-n5ujz0MEcFpFu0C2cx9SXe700fr6w:1776050798323&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOR7qB2_y5iVNSh5tGHzGGomyOKlTBWAMm66hiBJM4uzHT4-mYIwySuRr6ULdkGVwJxlAB3WfxKLiPUm5J3C19K5mOCP5&q=Tsangpool+Honda+Reviews&sa=X&ved=2ahUKEwjVjL_n8OmTAxXKSGwGHbdJAaAQ0bkNegQIOxAH&biw=1573&bih=993&dpr=1" target="_blank" rel="noopener noreferrer">
            Write a review
          </a>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-start mb-8">
        <div className="flex-1 w-full max-w-md">
          {[
            { stars: 5, percentage: 80 },
            { stars: 4, percentage: 75 },
            { stars: 3, percentage: 65 },
            { stars: 2, percentage: 55 },
            { stars: 1, percentage: 45 },
          ].map((item) => (
            <div key={item.stars} className="flex items-center gap-3 mb-1.5">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-3">{item.stars}</span>
              <div className="flex-1 h-[10px] bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#fbbc04] rounded-full"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center shrink-0 w-full md:w-auto">
          <div className="text-[64px] font-normal leading-none text-gray-800 dark:text-gray-100 mb-2">4.5</div>
          <div className="flex items-center gap-0.5 mb-1">
            {[1, 2, 3, 4].map((i) => (
              <Star key={i} className="w-5 h-5 fill-[#fbbc04] text-[#fbbc04]" />
            ))}
            <Star className="w-5 h-5 text-gray-300 dark:text-gray-600 fill-gray-300 dark:fill-gray-600" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">386 reviews</p>
        </div>
      </div>

      <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-4">Reviews</h3>
      
      <div className="flex flex-wrap gap-2 mb-6">
        <button className="px-4 py-1.5 rounded-full bg-[#e8f0fe] text-[#1967d2] hover:bg-[#d2e3fc] border border-transparent text-sm font-medium transition-colors">
          All
        </button>
        <button className="px-4 py-1.5 rounded-full bg-white dark:bg-card border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors">
          behaviour <span className="text-gray-500 font-normal ml-1">22</span>
        </button>
        <button className="px-4 py-1.5 rounded-full bg-white dark:bg-card border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors">
          service <span className="text-gray-500 font-normal ml-1">21</span>
        </button>
        <button className="px-4 py-1.5 rounded-full bg-white dark:bg-card border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors">
          staff <span className="text-gray-500 font-normal ml-1">15</span>
        </button>
        <button className="px-4 py-1.5 rounded-full bg-white dark:bg-card border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors">
          showroom <span className="text-gray-500 font-normal ml-1">9</span>
        </button>
        <button className="px-4 py-1.5 rounded-full bg-white dark:bg-card border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors">
          +6
        </button>
      </div>
      
      <Separator className="my-6" />

      <div className="mb-8">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Sort by</p>
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-1.5 rounded-full bg-[#e8f0fe] text-[#1967d2] hover:bg-[#d2e3fc] border border-transparent text-sm font-medium transition-colors">
            Most relevant
          </button>
          <button className="px-4 py-1.5 rounded-full bg-white dark:bg-card border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors">
            Newest
          </button>
          <button className="px-4 py-1.5 rounded-full bg-white dark:bg-card border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors">
            Highest
          </button>
          <button className="px-4 py-1.5 rounded-full bg-white dark:bg-card border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors">
            Lowest
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Mock Review Item */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-green-800 flex items-center justify-center shrink-0">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Nilutpol" alt="avatar" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Star className="w-2 h-2 text-white fill-white" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-[15px]">Nilutpol Bora</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Local Guide · 3 reviews · 69 photos</p>
              </div>
            </div>
            <button className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-[14px] h-[14px] fill-[#fbbc04] text-[#fbbc04]" />
              ))}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">5 months ago</span>
          </div>

          <p className="text-[15px] text-gray-800 dark:text-gray-200 mb-2 font-medium">Exceptional Service and Friendly Staff!</p>
          <p className="text-[15px] text-gray-800 dark:text-gray-200 mb-4">
            I had an absolutely wonderful experience purchasing my new Honda. The team was incredibly helpful, transparent, and made the entire process completely hassle-free from start to finish...{" "}
            <button className="text-blue-600 hover:underline font-medium">More</button>
          </p>

          <div className="flex items-center gap-4 mb-4">
            <button className="flex items-center justify-center p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <Heart className="w-[18px] h-[18px]" strokeWidth={2} />
            </button>
            <div className="flex items-center gap-1.5">
              <button className="flex items-center justify-center p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <Heart className="w-[18px] h-[18px] fill-red-500 text-red-500" strokeWidth={2} />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">24</span>
            </div>
            <button className="flex items-center justify-center p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <Share className="w-[18px] h-[18px]" strokeWidth={2} />
            </button>
          </div>

          {/* Owner Response */}
          <div className="flex gap-3 mt-4 ml-0 pl-4 border-l-[3px] border-gray-200 dark:border-gray-700 py-1">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-[14px]">Tsangpool Honda (owner)</h5>
                <span className="text-sm text-gray-500 dark:text-gray-400">4 months ago</span>
              </div>
              <p className="text-[14px] text-gray-800 dark:text-gray-200">
                Thank you so much for the glowing review, Nilutpol! We are thrilled to hear that you had a great experience with our team. Wishing you many happy miles on your new Ride!
              </p>
            </div>
          </div>
        </div>
        
        <Separator className="my-6" />
      </div>
    </div>
  );
}
