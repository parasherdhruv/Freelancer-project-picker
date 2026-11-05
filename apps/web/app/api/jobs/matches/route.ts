import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    matches: [
      {
        score: 92,
        breakdown: {
          skills: 38,
          title: 20,
          location: 15,
          salary: 15,
          experience: 10,
        },
        matchedSkills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL'],
        missingSkills: [],
        job: {
          id: 'job_fulltime_sample',
          title: 'Senior Full Stack / MERN Engineer',
          company: 'Fintech Solutions India',
          location: 'Bengaluru / Remote',
          workMode: 'REMOTE',
          sourceUrl: 'https://remoteok.com/remote-jobs/remote-senior-react-full-stack-developer-lemon-io-1137475',
          minLpa: 20,
          maxLpa: 26,
        },
      },
    ],
  });
}
