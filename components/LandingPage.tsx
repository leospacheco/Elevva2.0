
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, LogoIcon, MenuIcon, CloseIcon } from './Icons';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <LogoIcon className="w-10 h-10" />
          <span className="text-2xl font-bold text-gray-800">
            <span className="text-green-500">Elevva</span>
            <span className="text-blue-500">Web</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#services" className="text-gray-600 hover:text-blue-500 transition-colors">Serviços</a>
          <a href="#plans" className="text-gray-600 hover:text-blue-500 transition-colors">Planos</a>
          <a href="#contact" className="text-gray-600 hover:text-blue-500 transition-colors">Contato</a>
        </nav>
        <Link
          to="/login"
          className="hidden md:inline-block bg-blue-500 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-600 transition-all shadow-md hover:shadow-lg"
        >
          Área do Cliente
        </Link>
        {/* Hamburger Button */}
        <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
                {isMenuOpen ? <CloseIcon className="w-6 h-6 text-gray-700" /> : <MenuIcon className="w-6 h-6 text-gray-700" />}
            </button>
        </div>
      </div>
       {/* Mobile Menu */}
       <div className={`transition-all duration-300 ease-in-out md:hidden ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
           <nav className="flex flex-col items-center space-y-4 py-4 border-t border-gray-200 bg-white/95 backdrop-blur-md">
                <a href="#services" onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:text-blue-500 transition-colors">Serviços</a>
                <a href="#plans" onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:text-blue-500 transition-colors">Planos</a>
                <a href="#contact" onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:text-blue-500 transition-colors">Contato</a>
                <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="bg-blue-500 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-600 transition-all shadow-md"
                >
                    Área do Cliente
                </Link>
           </nav>
       </div>
    </header>
  );
};

const Footer: React.FC = () => (
    <footer id="contact" className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6 text-center">
            <div className="flex justify-center items-center space-x-3 mb-4">
                <LogoIcon className="w-8 h-8"/>
                <h2 className="text-2xl font-bold">ElevvaWeb</h2>
            </div>
            <p className="mb-6 text-gray-400">Transformando ideias em realidade digital.</p>
            <div className="mb-6">
                <p><strong>Email:</strong> contato@elevvaweb.com</p>
                <p><strong>Telefone:</strong> (11) 99999-9999</p>
            </div>
            <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Elevva Web. Todos os direitos reservados.</p>
        </div>
    </footer>
);

const LandingPage: React.FC = () => {
  return (
    <div className="bg-gray-50 text-gray-800">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 text-center bg-white">
          <div className="container mx-auto px-6">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-100/30 via-blue-100/30 to-transparent opacity-50 -z-1"></div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
              Criação e <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">Crescimento Digital</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Nossos serviços são desenvolvidos com tecnologia de ponta para garantir que sua empresa atinja um próximo nível.
            </p>
            <a
              href="#plans"
              className="bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold px-8 py-4 rounded-lg text-lg hover:opacity-90 transition-opacity shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Ver Planos
            </a>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl font-bold text-center mb-12">Nossos Serviços</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Service Card 1 */}
                    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow border border-gray-100">
                        <h3 className="text-xl font-semibold mb-3 text-blue-600">Site Institucional</h3>
                        <p className="text-gray-600">Criamos sites profissionais e modernos que representam a essência da sua marca e atraem mais clientes.</p>
                    </div>
                    {/* Service Card 2 */}
                    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow border border-gray-100">
                        <h3 className="text-xl font-semibold mb-3 text-green-600">Aplicativo Web (Web App)</h3>
                        <p className="text-gray-600">Desenvolvemos aplicações web customizadas e escaláveis para otimizar processos e impulsionar seu negócio.</p>
                    </div>
                    {/* Service Card 3 */}
                    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow border border-gray-100">
                        <h3 className="text-xl font-semibold mb-3 text-gray-700">Manutenção e Suporte</h3>
                        <p className="text-gray-600">Oferecemos suporte contínuo para garantir que sua plataforma esteja sempre segura, atualizada e performando no seu melhor.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Plans Section */}
        <section id="plans" className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-2">Elevva Web: Planos de Criação e Crescimento Digital</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Escolha o plano ideal para iniciar ou expandir sua presença online. Oferecemos soluções completas com pagamento flexível.</p>

            <div className="flex flex-wrap justify-center gap-8">
              {/* Plan 1: Creation */}
              <div className="border-2 border-green-400 rounded-2xl p-8 w-full max-w-lg flex flex-col shadow-lg bg-green-50/30">
                <h3 className="text-2xl font-bold text-gray-700 text-center mb-2">1. Plano de Criação</h3>
                <p className="text-center text-gray-500 mb-6">(Pagamento Único)</p>
                <div className="divide-y divide-gray-200">
                    <div className="py-4">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold text-lg">Site Institucional <span className="text-gray-500 font-normal">(Site Padrão)</span></p>
                            <p className="font-bold text-green-600 text-lg">R$ 299,90</p>
                        </div>
                    </div>
                    <div className="py-4">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold text-lg">Aplicativo Web <span className="text-gray-500 font-normal">(Web App)</span></p>
                            <p className="font-bold text-green-600 text-lg">R$ 799,90</p>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex-grow">
                  <h4 className="font-semibold text-lg mb-3 text-gray-700">Serviços Inclusos:</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start"><CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-1" /> <span>Design Moderno e Responsivo</span></li>
                    <li className="flex items-start"><CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-1" /> <span>Hospedagem (1 ano inclusivo)</span></li>
                    <li className="flex items-start"><CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-1" /> <span>Funcionalidade Customizada</span></li>
                    <li className="flex items-start"><CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-1" /> <span>SEO Básico</span></li>
                    <li className="flex items-start"><CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-1" /> <span>Domínio incluso (seudominio.com)</span></li>
                  </ul>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-lg mb-3 text-gray-700">Condições de Pagamento:</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Em até 10x de R$29,99 (sem juros)</li>
                    <li>Pix</li>
                    <li>Boleto Bancário</li>
                  </ul>
                </div>
              </div>

              {/* Plan 2: Maintenance */}
              <div className="border-2 border-blue-400 rounded-2xl p-8 w-full max-w-lg flex flex-col shadow-lg bg-blue-50/30">
                <h3 className="text-2xl font-bold text-gray-700 text-center mb-2">2. Plano de Manutenção e Suporte</h3>
                <p className="text-center text-gray-500 mb-6">(Mensal Opcional)</p>
                 <div className="divide-y divide-gray-200">
                    <div className="py-4">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold text-lg">Plano Elevva Suporte Pro</p>
                            <p className="font-bold text-blue-600 text-lg">R$ 97,00/mês</p>
                        </div>
                    </div>
                </div>
                 <div className="mt-6 flex-grow">
                  <h4 className="font-semibold text-lg mb-3 text-gray-700">O que inclui:</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start"><CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-1" /> <span>Backups diários de banco de dados</span></li>
                    <li className="flex items-start"><CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-1" /> <span>Monitoração de CadaStro e Login</span></li>
                    <li className="flex items-start"><CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-1" /> <span>Atualização de segurança</span></li>
                    <li className="flex items-start"><CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-1" /> <span>Suporte de velocidade</span></li>
                  </ul>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-lg mb-3 text-gray-700">Benefícios Exclusivos:</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Desconto de 15% em novos projetos</li>
                    <li>Prioridade no atendimento</li>
                    <li>Suporte 24h</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;