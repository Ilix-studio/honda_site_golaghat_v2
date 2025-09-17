// import React, { useState } from "react";
// import { useGetBikesQuery } from "@/redux-store/services/BikeSystemApi/bikeApi";
// import { Bike } from "@/redux-store/slices/BikeSystemSlice/bikesSlice";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Loader2, Search, Filter, RefreshCw } from "lucide-react";

// interface BikeFilters {
//   category?: string;
//   minPrice?: number;
//   maxPrice?: number;
//   inStock?: boolean;
//   branch?: string;
//   search?: string;
//   sortBy?: string;
//   limit?: number;
//   page?: number;
// }

// const TestBike: React.FC = () => {
//   const [filters, setFilters] = useState<BikeFilters>({
//     limit: 10,
//     page: 1,
//     sortBy: "featured",
//   });

//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("");

//   const {
//     data: bikesResponse,
//     error,
//     isLoading,
//     isFetching,
//     refetch,
//   } = useGetBikesQuery(filters);

//   const bikes = bikesResponse?.data || [];
//   const totalBikes = bikesResponse?.total || 0;

//   const handleSearch = () => {
//     setFilters((prev) => ({
//       ...prev,
//       search: searchTerm,
//       page: 1,
//     }));
//   };

//   const handleCategoryFilter = (category: string) => {
//     setSelectedCategory(category);
//     setFilters((prev) => ({
//       ...prev,
//       category: category || undefined,
//       page: 1,
//     }));
//   };

//   const handleSortChange = (sortBy: string) => {
//     setFilters((prev) => ({
//       ...prev,
//       sortBy,
//       page: 1,
//     }));
//   };

//   const handlePriceFilter = (minPrice: number, maxPrice: number) => {
//     setFilters((prev) => ({
//       ...prev,
//       minPrice,
//       maxPrice,
//       page: 1,
//     }));
//   };

//   const clearFilters = () => {
//     setFilters({
//       limit: 10,
//       page: 1,
//       sortBy: "featured",
//     });
//     setSearchTerm("");
//     setSelectedCategory("");
//   };

//   const loadMore = () => {
//     setFilters((prev) => ({
//       ...prev,
//       page: (prev.page || 1) + 1,
//     }));
//   };

//   const formatPrice = (price: number) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       minimumFractionDigits: 0,
//     }).format(price);
//   };

//   if (error) {
//     return (
//       <div className='container mx-auto px-4 py-8'>
//         <Card className='border-red-200 bg-red-50'>
//           <CardContent className='p-6'>
//             <h3 className='text-lg font-semibold text-red-800 mb-2'>
//               Error Loading Bikes
//             </h3>
//             <p className='text-red-600 mb-4'>
//               {error && typeof error === "object" && "message" in error
//                 ? (error as any).message
//                 : "Failed to fetch bikes data"}
//             </p>
//             <Button
//               onClick={() => refetch()}
//               variant='outline'
//               className='text-red-600 border-red-300'
//             >
//               <RefreshCw className='w-4 h-4 mr-2' />
//               Try Again
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className='container mx-auto px-4 py-8'>
//       <div className='mb-8'>
//         <h1 className='text-3xl font-bold text-gray-900 mb-2'>
//           Test Bike Component
//         </h1>
//         <p className='text-gray-600'>
//           Testing useGetBikesQuery hook - Found {totalBikes} bikes
//         </p>
//       </div>

//       {/* Search and Filter Controls */}
//       <Card className='mb-6'>
//         <CardHeader>
//           <CardTitle className='flex items-center gap-2'>
//             <Filter className='w-5 h-5' />
//             Filters & Search
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
//             {/* Search */}
//             <div className='flex gap-2'>
//               <Input
//                 placeholder='Search bikes...'
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 onKeyPress={(e) => e.key === "Enter" && handleSearch()}
//               />
//               <Button onClick={handleSearch} size='sm'>
//                 <Search className='w-4 h-4' />
//               </Button>
//             </div>

//             {/* Category Filter */}
//             <select
//               value={selectedCategory}
//               onChange={(e) => handleCategoryFilter(e.target.value)}
//               className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//             >
//               <option value=''>All Categories</option>
//               <option value='sport'>Sport</option>
//               <option value='adventure'>Adventure</option>
//               <option value='cruiser'>Cruiser</option>
//               <option value='touring'>Touring</option>
//               <option value='naked'>Naked</option>
//               <option value='electric'>Electric</option>
//             </select>

//             {/* Sort */}
//             <select
//               value={filters.sortBy}
//               onChange={(e) => handleSortChange(e.target.value)}
//               className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
//             >
//               <option value='featured'>Featured</option>
//               <option value='price-low'>Price: Low to High</option>
//               <option value='price-high'>Price: High to Low</option>
//               <option value='newest'>Newest First</option>
//               <option value='engine-size'>Engine Size</option>
//               <option value='power'>Power</option>
//             </select>

//             {/* Clear Filters */}
//             <Button onClick={clearFilters} variant='outline'>
//               Clear Filters
//             </Button>
//           </div>

//           {/* Price Range */}
//           <div className='mt-4 flex gap-4'>
//             <Button
//               onClick={() => handlePriceFilter(0, 200000)}
//               variant={
//                 filters.minPrice === 0 && filters.maxPrice === 200000
//                   ? "default"
//                   : "outline"
//               }
//               size='sm'
//             >
//               Under ₹2L
//             </Button>
//             <Button
//               onClick={() => handlePriceFilter(200000, 500000)}
//               variant={
//                 filters.minPrice === 200000 && filters.maxPrice === 500000
//                   ? "default"
//                   : "outline"
//               }
//               size='sm'
//             >
//               ₹2L - ₹5L
//             </Button>
//             <Button
//               onClick={() => handlePriceFilter(500000, 1000000)}
//               variant={
//                 filters.minPrice === 500000 && filters.maxPrice === 1000000
//                   ? "default"
//                   : "outline"
//               }
//               size='sm'
//             >
//               ₹5L - ₹10L
//             </Button>
//             <Button
//               onClick={() => handlePriceFilter(1000000, 2000000)}
//               variant={
//                 filters.minPrice === 1000000 && filters.maxPrice === 2000000
//                   ? "default"
//                   : "outline"
//               }
//               size='sm'
//             >
//               Above ₹10L
//             </Button>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Loading State */}
//       {isLoading && (
//         <div className='flex justify-center items-center py-12'>
//           <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
//           <span className='ml-2 text-gray-600'>Loading bikes...</span>
//         </div>
//       )}

//       {/* Bikes Grid */}
//       {!isLoading && bikes.length > 0 && (
//         <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
//           {bikes.map((bike: Bike) => (
//             <Card
//               key={bike._id}
//               className='overflow-hidden hover:shadow-lg transition-shadow'
//             >
//               <div className='h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
//                 {bike.images && bike.images.length > 0 ? (
//                   <img
//                     src={bike.images[0]}
//                     alt={bike.modelName}
//                     className='h-full w-full object-cover'
//                     onError={(e) => {
//                       (e.target as HTMLImageElement).style.display = "none";
//                     }}
//                   />
//                 ) : (
//                   <div className='text-gray-400 text-center'>
//                     <div className='text-4xl mb-2'>🏍️</div>
//                     <div className='text-sm'>No Image</div>
//                   </div>
//                 )}
//               </div>

//               <CardContent className='p-4'>
//                 <div className='flex justify-between items-start mb-2'>
//                   <h3 className='font-semibold text-lg text-gray-900 truncate'>
//                     {bike.modelName}
//                   </h3>
//                   <Badge variant={bike.inStock ? "default" : "secondary"}>
//                     {bike.inStock ? "In Stock" : "Out of Stock"}
//                   </Badge>
//                 </div>

//                 <div className='space-y-2 text-sm text-gray-600'>
//                   <div className='flex justify-between'>
//                     <span>Category:</span>
//                     <span className='font-medium capitalize'>
//                       {bike.category}
//                     </span>
//                   </div>
//                   <div className='flex justify-between'>
//                     <span>Year:</span>
//                     <span className='font-medium'>{bike.year}</span>
//                   </div>
//                   <div className='flex justify-between'>
//                     <span>Engine:</span>
//                     <span className='font-medium'>{bike.engine}</span>
//                   </div>
//                   <div className='flex justify-between'>
//                     <span>Power:</span>
//                     <span className='font-medium'>{bike.power} HP</span>
//                   </div>
//                   <div className='flex justify-between'>
//                     <span>Transmission:</span>
//                     <span className='font-medium'>{bike.transmission}</span>
//                   </div>
//                 </div>

//                 {bike.features && bike.features.length > 0 && (
//                   <div className='mt-3'>
//                     <div className='flex flex-wrap gap-1'>
//                       {bike.features.slice(0, 3).map((feature, index) => (
//                         <Badge
//                           key={index}
//                           variant='outline'
//                           className='text-xs'
//                         >
//                           {feature}
//                         </Badge>
//                       ))}
//                       {bike.features.length > 3 && (
//                         <Badge variant='outline' className='text-xs'>
//                           +{bike.features.length - 3} more
//                         </Badge>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 <div className='mt-4 pt-3 border-t'>
//                   <div className='flex justify-between items-center'>
//                     <span className='text-2xl font-bold text-blue-600'>
//                       {formatPrice(bike.price)}
//                     </span>
//                     {bike.quantity && (
//                       <span className='text-sm text-gray-500'>
//                         Qty: {bike.quantity}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}

//       {/* No Results */}
//       {!isLoading && bikes.length === 0 && (
//         <Card className='text-center py-12'>
//           <CardContent>
//             <div className='text-6xl mb-4'>🔍</div>
//             <h3 className='text-xl font-semibold text-gray-900 mb-2'>
//               No Bikes Found
//             </h3>
//             <p className='text-gray-600 mb-4'>
//               Try adjusting your filters or search terms
//             </p>
//             <Button onClick={clearFilters} variant='outline'>
//               Clear All Filters
//             </Button>
//           </CardContent>
//         </Card>
//       )}

//       {/* Load More */}
//       {!isLoading && bikes.length > 0 && bikes.length < totalBikes && (
//         <div className='text-center mt-8'>
//           <Button onClick={loadMore} disabled={isFetching} className='px-8'>
//             {isFetching ? (
//               <>
//                 <Loader2 className='w-4 h-4 mr-2 animate-spin' />
//                 Loading...
//               </>
//             ) : (
//               `Load More (${bikes.length} of ${totalBikes})`
//             )}
//           </Button>
//         </div>
//       )}

//       {/* Debug Info */}
//       <Card className='mt-6 bg-gray-50'>
//         <CardHeader>
//           <CardTitle className='text-sm'>Debug Information</CardTitle>
//         </CardHeader>
//         <CardContent className='text-xs'>
//           <div className='grid grid-cols-2 gap-4'>
//             <div>
//               <strong>Current Filters:</strong>
//               <pre className='mt-1 text-xs bg-white p-2 rounded border'>
//                 {JSON.stringify(filters, null, 2)}
//               </pre>
//             </div>
//             <div>
//               <strong>API Response:</strong>
//               <div className='mt-1 text-xs bg-white p-2 rounded border'>
//                 <div>Loading: {isLoading ? "Yes" : "No"}</div>
//                 <div>Fetching: {isFetching ? "Yes" : "No"}</div>
//                 <div>Total Bikes: {totalBikes}</div>
//                 <div>Current Page: {bikesResponse?.currentPage || "N/A"}</div>
//                 <div>Total Pages: {bikesResponse?.totalPages || "N/A"}</div>
//                 <div>Has Error: {error ? "Yes" : "No"}</div>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default TestBike;
