import { Footer } from "../Footer";
import { Header } from "../Header";
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
