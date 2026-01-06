'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaPhone, 
  FaEnvelope, 
  FaClock, 
  FaFacebook, 
  FaInstagram, 
  FaTwitter, 
  FaLinkedin, 
  FaYoutube,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaTimes,
  FaHeadset,
  FaArrowLeft
} from 'react-icons/fa';
import { GiSparkPlug } from "react-icons/gi";
import { BsFillSendFill, BsStars } from "react-icons/bs";
import { TbMessages } from "react-icons/tb";
import { useRouter } from 'next/navigation';

export default function ContactPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const contactInfo = {
    phone: '+1 (555) 123-4567',
    email: 'contacto@empresa.com',
    hours: 'Lun-Vie: 9:00 AM - 6:00 PM\nSáb: 10:00 AM - 2:00 PM',
    address: 'Av. Principal 123, Ciudad, País'
  };

  const socialMedia = [
    { 
      icon: <FaFacebook />, 
      label: 'Facebook', 
      url: 'https://facebook.com', 
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    { 
      icon: <FaInstagram />, 
      label: 'Instagram', 
      url: 'https://instagram.com', 
      iconColor: 'text-pink-600 dark:text-pink-400'
    },
    { 
      icon: <FaTwitter />, 
      label: 'Twitter', 
      url: 'https://twitter.com', 
      iconColor: 'text-sky-500 dark:text-sky-400'
    },
    { 
      icon: <FaLinkedin />, 
      label: 'LinkedIn', 
      url: 'https://linkedin.com', 
      iconColor: 'text-blue-700 dark:text-blue-300'
    },
    { 
      icon: <FaYoutube />, 
      label: 'YouTube', 
      url: 'https://youtube.com', 
      iconColor: 'text-red-600 dark:text-red-400'
    },
    { 
      icon: <FaWhatsapp />, 
      label: 'WhatsApp', 
      url: 'https://wa.me/15551234567', 
      iconColor: 'text-emerald-600 dark:text-emerald-400'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Formulario enviado:', formData);
      alert('¡Mensaje enviado correctamente!');
      setIsModalOpen(false);
      setFormData({ email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error al enviar:', error);
      alert('Hubo un error al enviar el mensaje');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCall = () => {
    window.location.href = `tel:${contactInfo.phone.replace(/\D/g, '')}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen py-20 bg-neutral-50 dark:bg-neutral-900 p-4 md:p-8">
      {/* Modal de Contacto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-300 dark:border-neutral-700"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <FaEnvelope className="text-amber-500" />
                Enviar Mensaje
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <FaTimes className="text-neutral-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Tu Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Asunto *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="¿En qué podemos ayudarte?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Mensaje *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                  placeholder="Escribe tu mensaje aquí..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <BsFillSendFill />
                      <span>Enviar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <motion.button
            onClick={() => router.push('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
          >
            <FaArrowLeft className="text-sm" />
            <span>Volver al Inicio</span>
          </motion.button>
        </div>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <GiSparkPlug className="text-4xl text-neutral-700 dark:text-neutral-300" />
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white">
              Contáctanos
            </h1>
            <TbMessages className="text-4xl text-neutral-700 dark:text-neutral-300" />
          </div>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Estamos aquí para ayudarte. Ponte en contacto con nosotros por cualquier consulta.
          </p>
        </motion.div>

        {/* Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna Izquierda: Información de Contacto */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Teléfono */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              onClick={handleCall}
              className="cursor-pointer bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-300 dark:border-neutral-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <FaPhone className="text-2xl text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                    Teléfono
                  </h3>
                  <p className="text-lg text-emerald-600 dark:text-emerald-400 font-medium">
                    {contactInfo.phone}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    Haz clic para llamar
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Email */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-300 dark:border-neutral-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                  <FaEnvelope className="text-2xl text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                    Correo Electrónico
                  </h3>
                  <p className="text-lg text-amber-600 dark:text-amber-400 font-medium">
                    {contactInfo.email}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    Haz clic para enviar un mensaje
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Horarios */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-300 dark:border-neutral-700 p-6 shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <FaClock className="text-2xl text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                    Horarios de Atención
                  </h3>
                  <div className="text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
                    {contactInfo.hours}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Dirección */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-300 dark:border-neutral-700 p-6 shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-cyan-100 dark:bg-cyan-900/30">
                  <FaMapMarkerAlt className="text-2xl text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                    Dirección
                  </h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    {contactInfo.address}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Columna Derecha: Redes Sociales y Más */}
          <div>
            {/* Redes Sociales */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-300 dark:border-neutral-700 p-8 mb-8"
            >
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                <BsStars className="text-neutral-700 dark:text-neutral-300" />
                Síguenos en Redes
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                Mantente conectado y recibe las últimas actualizaciones.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {socialMedia.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.05,
                      y: -3
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center justify-center p-4 rounded-xl bg-neutral-50 dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all duration-300 border border-neutral-200 dark:border-neutral-600"
                  >
                    <div className={`text-3xl mb-2 ${social.iconColor}`}>
                      {social.icon}
                    </div>
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{social.label}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Mensaje de Contacto */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-300 dark:border-neutral-700 p-8"
            >
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <FaHeadset className="text-neutral-700 dark:text-neutral-300" />
                ¿Necesitas ayuda inmediata?
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Nuestro equipo está listo para asistirte. Puedes contactarnos por cualquiera de los medios disponibles.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    Respuesta en menos de 24 horas
                  </span>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    Soporte técnico especializado
                  </span>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    Atención personalizada
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCall}
                  className="py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-all flex items-center justify-center gap-2"
                >
                  <FaPhone />
                  <span>Llamar Ahora</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsModalOpen(true)}
                  className="py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-all flex items-center justify-center gap-2"
                >
                  <FaPaperPlane />
                  <span>Enviar Email</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Info Adicional */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 p-6 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <GiSparkPlug className="text-2xl text-neutral-700 dark:text-neutral-300" />
                <h4 className="font-bold text-neutral-900 dark:text-white">
                  Soporte Disponible
                </h4>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Contamos con planes de soporte empresarial con respuesta garantizada en menos de 2 horas.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 pt-8 border-t border-neutral-300 dark:border-neutral-700 text-center"
        >
          <p className="text-neutral-600 dark:text-neutral-400">
            © {new Date().getFullYear()} Tu Empresa. Todos los derechos reservados.
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">
            Página de contacto • Diseño neutral
          </p>
        </motion.div>
      </div>
    </div>
  );
}