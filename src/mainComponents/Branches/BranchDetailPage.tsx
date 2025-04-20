import { JSX, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ContactSection } from "../ContactSection";
import { branches, Branches, BranchType } from "./TwoBranch";
import { Footer } from "../Footer";
import { Header } from "../Header";

function BranchDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [branchData, setBranchData] = useState<BranchType | null>(null);

  // Find branch data based on the URL parameter
  useEffect(() => {
    const branch = branches.find((branch) => branch.id === id);
    if (branch) {
      setBranchData(branch);
    }
  }, [id]);

  // Format branch name for display
  const formatBranchName = (id: string | undefined): string => {
    if (!id) return "";
    return id
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (!branchData) {
    return (
      <main className='min-h-screen'>
        <Header />
        <div className='container px-4 md:px-6 py-20 text-center'>
          <h1 className='text-3xl font-bold mb-4'>Branch Not Found</h1>
          <p className='text-muted-foreground'>
            The branch you're looking for doesn't exist.
          </p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className='min-h-screen'>
      <Header />
      <div className='pt-24'>
        <div className='container px-4 md:px-6 py-8'>
          <h1 className='text-3xl font-bold mb-2'>
            Honda Motorcycles {formatBranchName(id)}
          </h1>
          <p className='text-muted-foreground mb-8'>
            Welcome to our {formatBranchName(id)} branch, offering the complete
            range of Honda motorcycles and exceptional service.
          </p>

          {/* Branch component with pre-selected branch */}
          <Branches defaultBranch={id} />

          {/* Contact section customized for this specific branch */}
          <div className='mt-12'>
            <ContactSection branch={branchData} />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default BranchDetailPage;
