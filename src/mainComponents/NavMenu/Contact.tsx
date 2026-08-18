import { Footer } from "../Home/Footer";
import { Header } from "../Home/Header/Header";
import { ContactSection } from "../Home/ContactSection";

export function Contact() {
  return (
    <>
      <Header />
      <main className='min-h-screen flex flex-col'>
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}

export default Contact;
