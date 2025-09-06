import { Header } from "@/mainComponents/Home/Header/Header";
import { Footer } from "../../Home/Footer";

import { Branches } from "./TwoBranch";

export default function BranchesPage() {
  return (
    <main className='min-h-screen'>
      <Header />
      <div className='pt-16'>
        <Branches />
      </div>
      <Footer />
    </main>
  );
}
