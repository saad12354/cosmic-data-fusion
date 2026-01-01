export interface Comment {
    id: string;
    userId: string;
    userName: string;
    userRole: string;
    content: string;
    timestamp: string;
    upvotes: number;
    replies?: Comment[];
}

export interface Post {
    id: string;
    userId: string;
    userName: string;
    userRole: string;
    group: string;
    timestamp: string;
    title: string;
    content: string;
    imageUrl?: string;
    tags: string[];
    upvotes: number;
    commentsCount: number;
    type: 'discussion' | 'discovery' | 'question' | 'data' | 'poll';
    comments: Comment[];
}

export interface AnomalyChallenge {
    id: string;
    challengeNumber: number;
    title: string;
    description: string;
    imageUrl?: string;
    options: {
        id: string;
        label: string;
        votes: number;
    }[];
    totalVotes: number;
    resolvesIn: string;
    topContributors: {
        name: string;
        correctPredictions: number;
        avatar?: string;
    }[];
}

export const MOCK_POSTS: Post[] = [
    {
        id: '1',
        userId: 'sarah_chen',
        userName: 'Dr. Sarah Chen',
        userRole: 'Galaxy Research Lead',
        group: 'Galaxy Research',
        timestamp: '3 hours ago',
        title: 'Incredible spiral structure in M51!',
        content: 'Just processed new data from Hubble showing unprecedented detail in M51\'s spiral arms. Notice the bright blue regions - those are massive star-forming regions! Data processed using COSMIC Data Fusion platform 🚀',
        imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=1000',
        tags: ['Galaxies', 'Hubble', 'Astrophotography'],
        upvotes: 156,
        commentsCount: 34,
        type: 'discovery',
        comments: [
            {
                id: 'c1',
                userId: 'james_park',
                userName: 'Dr. James Park',
                userRole: 'Astrophysicist',
                content: 'Stunning! The tidal interaction with NGC 5195 is clearly visible. Have you analyzed the velocity dispersion in those HII regions?',
                timestamp: '2 hours ago',
                upvotes: 45,
                replies: [
                    {
                        id: 'c2',
                        userId: 'sarah_chen',
                        userName: 'Dr. Sarah Chen',
                        userRole: 'Galaxy Research Lead',
                        content: 'Great question! I\'m running that analysis now. The preliminary data shows some interesting redshift variations. I\'ll share the velocity maps tomorrow!',
                        timestamp: '2 hours ago',
                        upvotes: 23,
                        replies: [
                            {
                                id: 'c3',
                                userId: 'maria_lopez',
                                userName: 'Prof. Maria Lopez',
                                userRole: 'Senior Researcher',
                                content: 'Can\'t wait to see those! I\'ve been working on similar structures in M101. We should compare notes - I think there\'s a pattern here.',
                                timestamp: '1 hour ago',
                                upvotes: 18,
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: '2',
        userId: 'alex_rivera',
        userName: 'Alex Rivera',
        userRole: 'Exoplanet Specialist',
        group: 'Exoplanet Hunters',
        timestamp: '5 hours ago',
        title: 'Transit data suggests Earth-sized planet in TRAPPIST-1 system?',
        content: 'I noticed a slight dip in the light curve for TRAPPIST-1 during the last observation cycle. If my calibration is correct, this could be a previously undetected rocky planet. Check out the light curve below.',
        imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&q=80&w=1000',
        tags: ['Exoplanets', 'DataAnalysis', 'TransitMethod'],
        upvotes: 89,
        commentsCount: 12,
        type: 'data',
        comments: [
            {
                id: 'c4',
                userId: 'chen_wei',
                userName: 'Dr. Chen Wei',
                userRole: 'Data Scientist',
                content: 'The signal-to-noise ratio looks a bit low. Did you account for stellar jitter?',
                timestamp: '4 hours ago',
                upvotes: 15,
            }
        ]
    },
    {
        id: '3',
        userId: 'astroguy',
        userName: 'Mark Stevenson',
        userRole: 'Amateur Astronomer',
        group: 'Stellar Evolution',
        timestamp: '12 hours ago',
        title: 'Question: Best telescope for spectral analysis on a budget?',
        content: 'I\'m looking to get into spectroscopy. Are there any affordable setups that can resolve H-alpha lines reasonably well?',
        tags: ['Question', 'Spectroscopy', 'Gear'],
        upvotes: 34,
        commentsCount: 25,
        type: 'question',
        comments: [
            {
                id: 'c5',
                userId: 'pro_lee',
                userName: 'Prof. Lee',
                userRole: 'Optics Expert',
                content: 'For a budget setup, the StarAnalyser 100 is a great entry point. Just screw it into your eyepiece or camera nosepiece!',
                timestamp: '10 hours ago',
                upvotes: 28,
            }
        ]
    },
    {
        id: '4',
        userId: 'maria_lopez',
        userName: 'Prof. Maria Lopez',
        userRole: 'Senior Researcher',
        group: 'Galaxy Research',
        timestamp: '1 day ago',
        title: 'Evidence of Dark Matter in NGC 4565?',
        content: 'Our latest rotation curve analysis of the Needle Galaxy (NGC 4565) shows significant flattening at large radii. This is a classic signature of a dark matter halo. I\'ve uploaded the full dataset to the folder shared below.',
        imageUrl: 'https://images.unsplash.com/photo-1462332420958-a05d1e002413?auto=format&fit=crop&q=80&w=1000',
        tags: ['DarkMatter', 'Dynamics', 'Galaxies'],
        upvotes: 210,
        commentsCount: 45,
        type: 'data',
        comments: []
    },
    {
        id: '5',
        userId: 'blackhole_fan',
        userName: 'Student_Jay',
        userRole: 'Ph.D Candidate',
        group: 'Stellar Evolution',
        timestamp: '2 days ago',
        title: 'Simulation: Accretion disk dynamics near Schwarzschild radius',
        content: 'Just finished a 48-hour simulation of plasma flows around a non-rotating black hole. The frame-dragging effects (even for Kerr metric) are fascinating when you visualize the photon sphere!',
        tags: ['BlackHole', 'Simulation', 'GR'],
        upvotes: 56,
        commentsCount: 8,
        type: 'discussion',
        comments: []
    },
    {
        id: '6',
        userId: 'comet_tracker',
        userName: 'Alice Wong',
        userRole: 'Observationalist',
        group: 'Asteroid Tracking',
        timestamp: '3 days ago',
        title: 'New Comet C/2024 V1 approaching perihelion',
        content: 'Observers in the Southern Hemisphere, get your gear ready! Magnitude is currently 6.5 and brightening. Tail structure is developing beautifully.',
        imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1000',
        tags: ['Comet', 'Observing', 'SolarSystem'],
        upvotes: 124,
        commentsCount: 19,
        type: 'discovery',
        comments: []
    },
    {
        id: '7',
        userId: 'seti_admin',
        userName: 'Dr. Seth Brown',
        userRole: 'SETI Project',
        group: 'Dark Matter Studies',
        timestamp: '4 days ago',
        title: 'Unusual narrowband signal from Proxima Centauri',
        content: 'We detected a 982 MHz signal that doesn\'t match known interference patterns. It\'s likely terrestrial, but we\'re following the protocol for verification.',
        tags: ['SETI', 'Signals', 'Astrobiology'],
        upvotes: 342,
        commentsCount: 89,
        type: 'discovery',
        comments: []
    },
    {
        id: '8',
        userId: 'moon_walker',
        userName: 'Buzz_99',
        userRole: 'Lunar Geologist',
        group: 'Stellar Evolution',
        timestamp: '5 days ago',
        title: 'Rare Mineral Found in South Pole-Aitken Basin Samples',
        content: 'The recent robotic return mission brought back something unexpected: a high concentration of ilmenite in a region we thought was mostly anorthosite.',
        tags: ['Moon', 'Geology', 'Luna'],
        upvotes: 78,
        commentsCount: 14,
        type: 'data',
        comments: []
    },
    {
        id: '9',
        userId: 'poll_master',
        userName: 'Admin',
        userRole: 'Community Manager',
        group: 'Galaxy Research',
        timestamp: '1 week ago',
        title: 'Poll: Which telescope launch are you most excited for?',
        content: 'With JWST already delivering, what\'s next on your radar? Nancy Grace Roman? ELT? HabWorlds?',
        tags: ['Poll', 'Future', 'Tech'],
        upvotes: 45,
        commentsCount: 67,
        type: 'poll',
        comments: []
    },
    {
        id: '10',
        userId: 'joke_star',
        userName: 'Sirius_Lee',
        userRole: 'Astro-Humorist',
        group: 'Exoplanet Hunters',
        timestamp: '1 week ago',
        title: 'Why did the star go to school?',
        content: 'Because it wanted to be a little brighter! (I\'ll see myself out through the event horizon)',
        tags: ['Humor', 'Lighthearted'],
        upvotes: 567,
        commentsCount: 23,
        type: 'discussion',
        comments: []
    }
];

export const GROUPS = [
    { id: 'g1', name: 'Galaxy Research', members: '2.3k', icon: '🔭', joined: true },
    { id: 'g2', name: 'Exoplanet Hunters', members: '1.8k', icon: '🪐', joined: true },
    { id: 'g3', name: 'Stellar Evolution', members: '987', icon: '🌟', joined: false },
    { id: 'g4', name: 'Dark Matter Studies', members: '5.2k', icon: '🌌', joined: false },
    { id: 'g5', name: 'Asteroid Tracking', members: '3.1k', icon: '☄️', joined: false },
];

export const MOCK_CHALLENGES: AnomalyChallenge[] = [
    {
        id: '47',
        challengeNumber: 47,
        title: "Strange spectral signature in the Andromeda Sector",
        description: "We've detected a recurring narrowband signal at 1.42 GHz with unusual modulation. Is it a pulsar, interference, or something else?",
        imageUrl: "https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&q=80&w=1000",
        options: [
            { id: '1', label: "Equipment Glitch", votes: 234 },
            { id: '2', label: "New Exoplanet", votes: 567 },
            { id: '3', label: "Binary Star System", votes: 123 },
            { id: '4', label: "Background Noise", votes: 89 },
        ],
        totalVotes: 1013,
        resolvesIn: "48 hours",
        topContributors: [
            { name: "Dr. Sarah Chen", correctPredictions: 15 },
            { name: "Alex Rivera", correctPredictions: 12 },
            { name: "Prof. Lee", correctPredictions: 11 },
        ]
    }
];
