/* ═══════════════════════════════════════════════════════════
   js/sections/faq.js
   SPIDER-VERSE FAQ
   Interactive conversation between Miles and Peter
═══════════════════════════════════════════════════════════ */

const FAQ_DATA = [
    { q: 'Who can participate in Tech-A-Week 1.0?', a: 'Only students of GLA University can participate.<br><br>Students from any other college are not allowed to participate in any event.' },
    { q: 'Can students from other colleges join?', a: 'No. Tech-A-Week 1.0 is open to GLA University students only.' },
    { q: 'Is there a registration fee?', a: 'No. Registration is completely free.' },
    { q: 'When does registration open?', a: 'Registration for all events will open soon on this website. Keep an eye on this page.' },
    { q: 'What are the dates of the event?', a: 'The dates have not been revealed yet. They are revealing soon.' },
    { q: 'What events are part of Tech-A-Week 1.0?', a: 'Tech-A-Week 1.0 includes:<br>• Ideathon<br>• Tech Debate<br>• Project Exhibition<br>• 2 workshops (IoT &amp; AI, and Fullstack, Cloud &amp; Cyber)' },
    { q: 'Who is organising Tech-A-Week 1.0?', a: 'FUSION Club, the IoT, Robotics and Drones Club of GLA University, organises the entire event, in collaboration with the AI, Cloud and Cyber clubs and Meraki Chronicles (Literature Club).' },
    { q: 'How does the Ideathon work?', a: 'The Ideathon is for early-stage innovation and problem pitching, focused on tech-driven solutions to real-world challenges.<br><br>• Team size: 2–4 students<br>• Pitch time: 8 minutes per team<br>• 5-minute presentation + 3-minute Q&amp;A with the jury' },
    { q: 'What should our Ideathon presentation include?', a: 'A PPT of a maximum of 7 slides covering:<br>• The problem<br>• Target audience<br>• Tech architecture<br>• Proposed solution' },
    { q: 'Can the audience ask questions during the Ideathon?', a: 'Yes. Presentations are held openly in front of all participants, and the audience can ask questions to the presenting team.' },
    { q: 'Who can take part in the Tech Debate?', a: 'The Tech Debate is for B.Tech 1st Year students of AIML, CSE, ECE and AI.<br><br>Each team has 4 students.' },
    { q: 'How is the Tech Debate conducted?', a: 'Each match runs 10–12 minutes and has opening statements, a rebuttal round and a judges&apos; Q&amp;A.<br><br>• Round 1 (Screening): 10:30 AM – 1:00 PM<br>• Final Round: 2:40 PM – 4:40 PM' },
    { q: 'What are the Tech Debate topics?', a: 'The topics have not been decided yet. Every club will have different topics, and they will be revealed soon.' },
    { q: 'What can be exhibited in the Project Exhibition?', a: 'Only innovative hardware projects.<br><br>The exhibition is a physical showcase of hands-on prototypes and functional tech models.' },
    { q: 'Who organises the Project Exhibition?', a: 'The Project Exhibition is organised completely by the FUSION Club (IoT, Robotics &amp; Drones).' },
    { q: 'What workshops will be held?', a: 'There are 2 workshops:<br>• Workshop 1: IoT &amp; AI, by the IoT and AI clubs<br>• Workshop 2: Fullstack, Cloud &amp; Cyber, by the Fullstack, Cloud and Cyber clubs<br><br>Dates and speakers are revealing soon.' },
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
