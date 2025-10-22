// leospacheco/elevva2.0/.../components/FloatingWhatsApp.tsx

import React from 'react';
import { WhatsAppIcon } from './Icons';

const FloatingWhatsApp: React.FC = () => {
  // Mensagem codificada para URL: "Olá! Gostaria de falar sobre os serviços da Elevva Web."
  const prefilledMessage = "Ol%C3%A1!%20Gostaria%20de%20falar%20sobre%20os%20servi%C3%A7os%20da%20Elevva%20Web.";
  const whatsappNumber = "5541920001320";

  return (
    <a
      // NOVO LINK: Número + parâmetro text com a mensagem pré-preenchida
      href={`https://wa.me/${whatsappNumber}?text=${prefilledMessage}`} 
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform transform hover:scale-110 z-50"
      aria-label="Contact us on WhatsApp"
    >
      <WhatsAppIcon className="w-8 h-8" />
    </a>
  );
};

export default FloatingWhatsApp;