import { Header } from "./mainComponents/Header";
import HondaCarousel from "./mainComponents/HondaCarousel";

function Home() {
  return (
    <main className='min-h-screen flex flex-col'>
      <Header />
      <HondaCarousel />
    </main>
  );
}

export default Home;
