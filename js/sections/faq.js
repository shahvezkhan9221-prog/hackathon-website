/* ═══════════════════════════════════════════════════════════
   js/sections/faq.js
   SPIDER-VERSE FAQ
   Interactive conversation between Miles and Peter
═══════════════════════════════════════════════════════════ */

const FAQ_DATA = [
    { q: 'Who can participate in Tech-A-Week 1.0?', a: 'Only students of GLA University can participate.<br><br>Students from any other college are not allowed to participate in any event.' },
    { q: 'Can students from other colleges join?', a: 'No. Tech-A-Week 1.0 is open to GLA University students only.' },
    { q: 'Is there a registration fee?', a: 'No. Registration is completely free.' },
    { q: 'How do I register?', a: 'Registrations are live for the Ideathon and the Micro Fusion workshop.<br><br>• Ideathon: register on Unstop using the Register Now button in the Ideathon card.<br>• Micro Fusion workshop: register through the Google Form linked in the Workshop section.<br><br>Tech Debate registration opens soon.' },
    { q: 'What are the dates of the event?', a: '• Micro Fusion workshop: Monday, 26 October 2026, 12:00 PM, Test Centre B<br>• Hackathon: 23 November<br><br>Other dates are revealing soon.' },
    { q: 'What events are part of Tech-A-Week 1.0?', a: 'Tech-A-Week 1.0 includes:<br>• Ideathon<br>• Tech Debate<br>• Hackathon (23 November, details locked)<br>• Micro Fusion workshop (IoT &amp; Robotics)' },
    { q: 'Who is organising Tech-A-Week 1.0?', a: 'FUSION Club, the IoT, Robotics and Drones Club of GLA University, organises the entire event. The Tech Debate is organised in collaboration with the Synapse, Cloud, Cyber and Fullstack clubs.' },
    { q: 'What is the team size for each event?', a: '• Ideathon: 3 members per team<br>• Tech Debate: 4 members per team<br>• Hackathon: details are locked and will be revealed soon' },
    { q: 'How does the Ideathon work?', a: 'The Ideathon is for early-stage innovation and problem pitching, focused on tech-driven solutions to real-world challenges.<br><br>• Team size: 3 members<br>• Pitch time: 8 minutes per team<br>• 5-minute presentation + 3-minute Q&amp;A with the jury' },
    { q: 'What should our Ideathon presentation include?', a: 'A PPT of a maximum of 7 slides covering:<br>• The problem<br>• Target audience<br>• Tech architecture<br>• Proposed solution' },
    { q: 'Can the audience ask questions during the Ideathon?', a: 'Yes. Presentations are held openly in front of all participants, and the audience can ask questions to the presenting team.' },
    { q: 'Who can take part in the Tech Debate?', a: 'The Tech Debate is for B.Tech 1st Year students of AIML, CSE, ECE and AI.<br><br>Each team has 4 members.<br><br>Debate domains: AI, IoT, Cloud, Cybersecurity and Full Stack.' },
    { q: 'How is the Tech Debate conducted?', a: 'Each match runs 10–12 minutes and has opening statements, a rebuttal round and a judges&apos; Q&amp;A.<br><br>• Round 1 (Screening): 10:30 AM – 1:00 PM<br>• Final Round: 2:40 PM – 4:40 PM' },
    { q: 'What are the Tech Debate topics?', a: 'The topics have not been decided yet. Every club will have different topics, and they will be revealed soon.' },
    { q: 'When is the Hackathon?', a: 'The Hackathon will be held on 23 November. Its other details are locked for now and will be revealed soon.' },
    { q: 'What workshop will be held?', a: 'Micro Fusion: Brains Behind The Machines, a hands-on Raspberry Pi workshop by FUSION Club (IoT &amp; Robotics).<br><br>• Date: Monday, 26 October 2026<br>• Time: 12:00 PM<br>• Venue: Test Centre B<br>• Instructor: Mr. Utkarsh Raj<br>• Limited to the first 50 registrations; selected participants are confirmed via WhatsApp.' },
    { q: 'Who will mentor the participants?', a: 'Industry leaders will mentor the participants. The mentors are revealing soon.' },
    { q: 'Who can I contact for queries?', a: 'Coordinator details will be added soon. Until then, please check back on this page.' }
];

export function initFAQ() {
    setupCustomDropdown();
}

function setupCustomDropdown() {
    const customSelect = document.getElementById('faq-custom-select');
    const trigger = document.getElementById('faq-custom-select-trigger');
    const optionsContainer = document.getElementById('faq-custom-select-options');
    const milesDefaultText = document.getElementById('miles-default-text');
    const peterAnswer = document.getElementById('peter-answer-text');

    if (!trigger || !optionsContainer || !milesDefaultText || !peterAnswer) return;

    FAQ_DATA.forEach((item, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'faq-custom-option';
        optionDiv.textContent = `${index + 1}. ${item.q}`;
        
        optionDiv.addEventListener('click', () => {
            trigger.textContent = `${index + 1}. ${item.q}`;
            
            peterAnswer.classList.remove('typing');
            void peterAnswer.offsetWidth;
            peterAnswer.innerHTML = item.a;
            peterAnswer.classList.add('typing');
            
            customSelect.classList.remove('open');
        });
        
        optionsContainer.appendChild(optionDiv);
    });

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        customSelect.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (customSelect && !customSelect.contains(e.target)) {
            customSelect.classList.remove('open');
        }
    });
}
