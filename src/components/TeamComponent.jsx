"use client"
import Image from "next/image"
export function TeamComponent() {
  const leadershipTeam = [
    {
      name: "Prof. P Radha Krishna",
      position: "CEO and Director",
      image: "/images/team/radhakrisha.png",
      phone: "+91-XXXXXXXXXX",
      email: "radha@nitw.ac.in"
    },
    {
      name: "Dr. Sangharatna Godboley",
      position: "Chairman and Director",
      image: "/images/team/sangarthana.png",
      phone: "+91-7013306805",
      email: "sanghu@nitw.ac.in"
    }
  ]

  const supportingTeam = [
    {
      name: "Mrs. Vani Puligilla",
      position: "Project Scientist",
      image: "/images/team/vani.png",
      phone: "+91-XXXXXXXXXX",
      email: "vani@nitw.ac.in"
    },
    {
      name: "Mr. Abhiraj Kumar",
      position: "Sr. Software Engineer",
      image: "/images/team/abhirajkumar.png",
      phone: "+91-XXXXXXXXXX",
      email: "abhiraj@nitw.ac.in"
    },
    {
      name: "Mr. Kandrathi Chandrashekar",
      position: "Sr. Software Engineer",
      image: "/images/team/chandrasekhar.png",
      phone: "+91-XXXXXXXXXX",
      email: "chandrashekar@nitw.ac.in"
    },
    {
      name: "Mr. Nallella Nihal",
      position: "Jr. Software Engineer",
      image: "/images/team/nihal.png",
      phone: "+91-XXXXXXXXXX",
      email: "nihal@nitw.ac.in"
    },
    {
      name: "Mr. Raj Kumar Gunda",
      position: "Jr. Programmer",
      image: "/images/team/rajkumar.png",
      phone: "+91-XXXXXXXXXX",
      email: "raj@nitw.ac.in"
    },
    {
      name: "Mr. Vishal Kumar Swain",
      position: "Junior Research Fellow (JRF)",
      image: "/images/team/vishal.png",
      phone: "+91-XXXXXXXXXX",
      email: "vishal@nitw.ac.in"
    },
    {
      name: "Mr. Kiran Kumar Sahu",
      position: "Junior Research Fellow (JRF)",
      image: "/images/team/kirankumar.png",
      phone: "+91-XXXXXXXXXX",
      email: "kiran@nitw.ac.in"
    },
    {
      name: "Mr. Eti Dhanush",
      position: "Intern",
      image: "/images/team/dhanush.png",
      phone: "+91-XXXXXXXXXX",
      email: "dhanush@nitw.ac.in"
    },
    {
      name: "Ms. ShriLakshmi Kakati",
      position: "Intern",
      image: "/images/team/sreelakshmi.png",
      phone: "+91-XXXXXXXXXX",
      email: "shrilakshmi@nitw.ac.in"
    }
  ]

  const TeamCard = ({ member }) => (
    <div className="flex justify-center">
      <div className="max-w-xs w-full hover:scale-105 transition-transform duration-300">
        <div className="bg-white dark:bg-zinc-900 shadow-lg rounded-2xl p-6 hover:shadow-2xl transition-shadow duration-300">
          <div className="mb-4">
            <img 
              className="w-40 h-40 rounded-full mx-auto object-cover hover:scale-110 transition-transform duration-300 shadow-md" 
              src={member.image} 
              alt={member.name}
            />
          </div>
          <div>
            <h3 className="text-center text-xl text-gray-900 dark:text-white font-black mb-2 leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {member.name}
            </h3>
            <div className="text-center text-gray-600 dark:text-gray-400 text-sm font-semibold">
              <p>{member.position}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
      `}</style>
      
      <section className="w-full py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-black" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-black dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Our <span className="text-blue-600 dark:text-blue-400">Team</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium">
              Meet the talented individuals driving innovation at NitMiner Technologies
            </p>
          </div>

          {/* Leadership Team */}
          <div className="mb-20">
            <h2 className="text-3xl font-black mb-12 text-black dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Leadership Team
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
              {leadershipTeam.map((member, index) => (
                <TeamCard key={index} member={member} />
              ))}
            </div>
          </div>

          {/* Supporting Team */}
          <div>
            <h2 className="text-3xl font-black mb-12 text-black dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Our Supporting Team
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {supportingTeam.map((member, index) => (
                <TeamCard key={index} member={member} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}