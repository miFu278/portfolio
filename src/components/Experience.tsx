import React from 'react';

const Experience: React.FC = () => {
  return (
    <section id="experience" className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 scroll-mt-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">Experience</h2>
          <p className="text-sm sm:text-base text-gray-400 mt-2">Building maintainable backend systems in a collaborative team.</p>
        </div>

        <article className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">Backend Engineer Intern</h3>
              <p className="text-gray-300 mt-1">Tel4VN · Ho Chi Minh City, Vietnam</p>
            </div>
            <p className="text-sm font-medium text-gray-400 sm:text-right">Jan 2026 - May 2026</p>
          </div>

          <ul className="space-y-3 text-sm sm:text-base text-gray-300 leading-relaxed list-disc pl-5">
            <li>Developed approximately 50 REST API endpoints in Go for an internal HR management system covering employee, attendance, leave, email, and notification workflows.</li>
            <li>Designed the backend architecture and PostgreSQL data model, including relationships, migrations, indexes, and JWT-based role-based access control.</li>
            <li>Established a Clean Architecture codebase, repository workflow, and Git conventions while coordinating backend delivery and API integration in a 7-member cross-functional team.</li>
          </ul>
        </article>
      </div>
    </section>
  );
};

export default Experience;
