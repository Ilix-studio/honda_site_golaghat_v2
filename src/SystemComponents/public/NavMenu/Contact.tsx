import { Header } from "@/SystemComponents/headers/Header";
import { ContactSection } from "../Home/ContactSection";
import { Footer } from "../Home/Footer";

export function Contact() {
  return (
    <main className='min-h-screen flex flex-col'>
      <Header />

      <ContactSection />

      <Footer />
    </main>
  );
}

export default Contact;
