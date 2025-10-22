import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const GenerateTags = () => {
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [tagline, setTagline] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#ff3b30");
  const [textColor, setTextColor] = useState("#ffffff");

  // Generate 6 QR codes with the same info
  const tags = Array(6).fill(null);

  return (
    <div className='p-4 max-w-5xl mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>Scan-to-Call Tag Generator</h1>

      <div className='bg-gray-100 p-4 rounded-lg mb-8'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block mb-2 font-medium'>Phone Number</label>
            <input
              type='tel'
              className='w-full p-2 border rounded'
              placeholder='e.g., +91 9876543210'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className='block mb-2 font-medium'>Company Name</label>
            <input
              type='text'
              className='w-full p-2 border rounded'
              placeholder='e.g., TSANGPOOL HONDA'
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div>
            <label className='block mb-2 font-medium'>Tagline</label>
            <input
              type='text'
              className='w-full p-2 border rounded'
              placeholder='e.g., Goaghat'
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>

          <div>
            <label className='block mb-2 font-medium'>Background Color</label>
            <div className='flex items-center'>
              <input
                type='color'
                className='h-10 w-10 mr-2'
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
              />
              <input
                type='text'
                className='w-full p-2 border rounded'
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className='block mb-2 font-medium'>Text Color</label>
            <div className='flex items-center'>
              <input
                type='color'
                className='h-10 w-10 mr-2'
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
              />
              <input
                type='text'
                className='w-full p-2 border rounded'
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {tags.map((_, index) => (
          <div
            key={index}
            className='overflow-hidden rounded-lg shadow-lg'
            style={{
              backgroundColor: backgroundColor,
              color: textColor,
              pageBreakInside: "avoid",
            }}
          >
            <div className='p-4 text-center'>
              <h2 className='text-xl font-bold mb-1'>
                {companyName || "TSANGPOOL HONDA"}
              </h2>
              <p className='text-sm mb-3'>{tagline || "Goaghat"}</p>
              <p className='text-sm mb-1'>SCAN TO CALL SERVICE</p>

              <div className='bg-white p-2 inline-block rounded-lg mx-auto mb-2'>
                <QRCodeSVG
                  value={`tel:${phone || "+919876543210"}`}
                  size={120}
                  bgColor='#ffffff'
                  fgColor='#000000'
                  level='H'
                />
              </div>

              <p className='text-sm'>#Call for help by scanning the QR code</p>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-8 mb-4'>
        <h2 className='text-lg font-semibold mb-2'>Instructions:</h2>
        <ol className='list-decimal pl-5 space-y-1'>
          <li>Enter your phone number, company name, and tagline</li>
          <li>Customize colors as needed</li>
          <li>Print the page</li>
          <li>Cut out the individual cards</li>
          <li>Place them in visible locations for customers</li>
        </ol>
      </div>
    </div>
  );
};

export default GenerateTags;
