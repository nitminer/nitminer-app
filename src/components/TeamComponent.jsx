"use client"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { FiMail, FiPhone, FiGithub, FiLinkedin } from "react-icons/fi"

export function TeamComponent() {
  const supportingTeam = [
    { name: "Mrs. Vani Puligilla", position: "Project Scientist", image: "/images/team/vani.png", email: "vani@nitw.ac.in" },
    { name: "Mr. Abhiraj Kumar", position: "Sr. Software Engineer", image: "/images/team/abhirajkumar.png", email: "abhiraj@nitw.ac.in" },
    { name: "Mr. Kandrathi Chandrashekar", position: "Sr. Software Engineer", image: "/images/team/chandrasekhar.png", email: "chandrashekar@nitw.ac.in" },
    { name: "Mr. Nallella Nihal", position: "Jr. Software Engineer", image: "/images/team/nihal.png", email: "nihal@nitw.ac.in" },
    { name: "Mr. Raj Kumar Gunda", position: "Jr. Programmer", image: "/images/team/rajkumar.png", email: "raj@nitw.ac.in" },
    { name: "Mr. Vishal Kumar Swain", position: "Junior Research Fellow (JRF)", image: "/images/team/vishal.png", email: "vishal@nitw.ac.in" },
    { name: "Mr. Kiran Kumar Sahu", position: "Junior Research Fellow (JRF)", image: "/images/team/kirankumar.png", email: "kiran@nitw.ac.in" },
    { name: "Mr. Eti Dhanush", position: "Intern", image: "/images/team/dhanush.png", email: "dhanush@nitw.ac.in" },
    { name: "Ms. ShriLakshmi Kakati", position: "Intern", image: "/images/team/sreelakshmi.png", email: "shrilakshmi@nitw.ac.in" }
  ];

  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative w-full py-24 mt-3 bg-[#F5F1FF] dark:bg-[#0A0A0A] overflow-hidden" 
      style={{ fontFamily: "'League Spartan', sans-serif" }}
    >
      {/* Background Auras */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-black tracking-[0.3em] text-indigo-600 bg-indigo-100 dark:bg-indigo-900/40 rounded-full uppercase">
            The Innovators
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-[#3F3351] dark:text-white tracking-tighter uppercase mb-6">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Expert Team.</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-bold italic border-l-4 border-indigo-500 pl-6">
            Meet the researchers and engineers pioneering the next generation of blockchain and AI at NitMiner Technologies.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {supportingTeam.map((member, index) => (
            <div 
              key={index}
              className={`group relative transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="relative p-8 bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[40px] shadow-xl hover:shadow-indigo-500/20 transition-all duration-500 overflow-hidden">
                
                {/* Image Section */}
                <div className="relative mb-8 flex justify-center">
                  {/* Glowing background behind image */}
                  <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-75 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                    <Image 
                      src={member.image} 
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="(max-w-160px) 100vw"
                    />
                  </div>
                </div>

                {/* Info Section */}
                <div className="text-center">
                  <h3 className="text-2xl font-black text-[#3F3351] dark:text-white uppercase tracking-tighter mb-2">
                    {member.name}
                  </h3>
                  <p className="text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-widest mb-6">
                    {member.position}
                  </p>

                  {/* Social Links / Hover Reveal */}
                  <div className="flex w-full  gap-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    {/* <a href={`mailto:${member.email}`} className="p-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors">
                      <FiMail size={20} />
                    </a> */}
                    <a href="#" className="p-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors">
                      <FiLinkedin size={20} />
                    </a>
                    {/* <a href="#" className="p-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors">
                      <FiGithub size={20} />
                    </a> */}
                  </div>
                </div>

                {/* Corner Decorative Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12 group-hover:bg-indigo-500/20 transition-colors"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}