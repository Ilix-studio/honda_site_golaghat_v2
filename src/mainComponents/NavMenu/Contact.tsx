import { Footer } from "../Home/Footer";
import { Header } from "../Home/Header/Header";
import { ContactSection } from "../Home/ContactSection";

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
