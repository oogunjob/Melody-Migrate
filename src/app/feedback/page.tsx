import React from 'react';
import SEO from '../components/seo';
import Footer from '../components/footer';

function Feedback() {
  return (
    <div className='flex flex-col bg-[#f8f8f8] min-h-screen'>
      <SEO title="Feedback" description="Testing" />

      <section id="privacy" className='flex-1'>
        <h1 className='flex justify-center font-semibold text-2xl md:text-4xl pb-7 py-10'>Feedback</h1>
        <div className='max-w-sm md:max-w-2xl mx-5 md:mx-auto'>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default Feedback;
