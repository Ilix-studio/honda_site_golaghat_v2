import { motion } from "framer-motion";
import RecentMotorcycles from "../AdminDash/RecentMotocycles";

const AllBikesForAdmin = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.45 }}
    >
      <RecentMotorcycles />
    </motion.div>
  );
};

export default AllBikesForAdmin;
