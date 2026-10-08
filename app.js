/**
 * Vivek साथी - AI Mentorship, Stories & Youth Community Engine
 * Pure Email Auth, Dynamic Google Auth & Unique User Handles for Youth Sangam
 */

// ==========================================
// 1. STATE & STORAGE
// ==========================================
const AppState = {
  currentLang: localStorage.getItem('vivek_lang') || 'hinglish',
  currentTheme: localStorage.getItem('vivek_theme') || 'dark',
  currentTab: 'mentorship',
  karmaPoints: parseInt(localStorage.getItem('vivek_karma') || '350', 10),
  
  // Multi-Language HD Video State
  currentVideoTheme: 'fear_courage',
  currentVideoLang: localStorage.getItem('vivek_lang') || 'hinglish',
  videoPlayerMode: 'real', // 'real' (MP4 with audio) or 'canvas' (generative)
  
  // Current Logged-in User
  currentUser: JSON.parse(localStorage.getItem('vivek_user') || 'null'),
  
  // Audio state
  isAudioPlaying: false,
  audioDuration: 20,
  audioCurrentTime: 0,
  audioTimerInterval: null,
  
  // Ambient Sound state
  ambientAudioCtx: null,
  isAmbientPlaying: false,
  ambientOscillators: [],
  
  // Video Canvas state
  isVideoPlaying: false,
  videoAnimFrameId: null,
  videoCurrentTime: 0,
  videoTotalDuration: 32,
  videoTimeline: null,
  currentScene: 1,
  scenePauseTimer: null,
  isSpeechActive: false,
  videoLoadedImage: null,
  videoImgVivek: null,
  videoImgMeditation: null,
  videoParticles: [],
  videoEmbers: [],
  videoPetals: [],
  videoRipples: [],
  videoTheme: null,
  isSwamiVoiceMuted: false,
  lastSpokenScene: -1,
  activeSpeechUtterance: null,
  
  // Speech Recognition
  recognition: null,
  isListening: false,
  
  // Current Guidance & Story
  currentGuidance: null,
  
  // Pending OTP Target
  otpPendingEmail: '',

  // User-created community posts
  userCommunityPosts: [],

  // Sadhana & Action State
  selectedSadhanaDays: 7,
  activeSadhanaChallenge: null,
  next24Items: [],
  dayPendingProof: {},
  isRecordingVoice: false,
  mediaRecorderInstance: null,
  voiceRecordChunks: [],
  voiceTimerInterval: null,
  voiceRecordSeconds: 0
};

// ==========================================
// MULTILINGUAL DICTIONARY (ENGLISH, HINDI, HINGLISH)
// ==========================================
const Translations = {
  english: {
    // Brand
    brand_title_latin: "Vivek",
    brand_title_hindi: "Saarthi",
    brand_subtitle: "AI Mentor & Youth Sangam",

    // Nav
    nav_mentorship: "Vivek Vani (AI Mentor)",
    nav_community: "Youth Sangam",
    nav_store: "Karma & Pro Store",
    auth_btn_login: "Login / Register",

    // Hero
    hero_pill: "Swami Vivekananda NLP Wisdom Engine & Voice AI",
    hero_title_1: "Arise, Awake!",
    hero_title_2: "Discover Divine Guidance for Every Dilemma.",
    hero_desc: "Share your life situation — our AI model provides authentic stories from Swami Vivekananda's life, empowering Sanskrit slogans, baritone voice guidance, and custom video storyboards. Help peers in the community to earn Karma points!",
    stat_free: "1 Month Free Access",
    stat_youth: "Youth Mentored",
    stat_karma: "Karma Points Earned",
    badge_voice_title: "Vivekananda Baritone Voice",
    badge_voice_sub: "Authentic Stories & Slogans",
    badge_sangam_title: "Unique Sangam Accounts",
    badge_sangam_sub: "Unique @handles & Karma",

    // Mentorship Form
    form_title: "Share Your Situation",
    form_subtitle: "AI model provides guidance from Swami Vivekananda's stories & slogans",
    quick_topics_label: "Common Life Dilemmas:",
    chip_fear: "⚡ Fear of Failure & Exam Anxiety",
    chip_discipline: "📱 Phone Addiction & Low Focus",
    chip_breakup: "💔 Rejection & Low Self-Esteem",
    chip_strength: "🏋️ Physical & Mental Weakness",
    chip_purpose: "🧭 Finding Life Purpose & Direction",
    btn_generate: "Hear Swami ji's Story, Slogan & Voice",
    guarantee_text: "100% Confidential",
    api_settings_link: "⚙️ Video & Voice API Settings",

    // Mentorship Result States
    empty_title: "Your Guidance Will Manifest Here",
    empty_desc: "Type your situation on the left or use the microphone. AI will generate an authentic story, Mahavakya slogan, baritone voice, and matched video capsule.",
    processing_title: "Consulting Swami Vivekananda's Teachings...",
    processing_desc: "NLP model running • Matching authentic story • Synthesizing baritone voice • Preparing video storyboard",
    result_badge: "Vivek Saarthi Guidance Capsule",
    karma_awarded_tag: "⚡ +10 Karma Awarded",
    story_badge: "📖 Swami Vivekananda's Real Story",
    lesson_prefix: "Life Lesson:",
    voice_title: "Listen in Swami Vivekananda's Baritone Voice",
    voice_subtitle: "Deep Baritone AI Voice • Story Narration & Slogan",
    video_badge: "AI Video Storyboard Capsule",
    video_scene_1: "Scene 1: Dilemma (0:00)",
    video_scene_2: "Scene 2: Parable (0:22)",
    video_scene_3: "Scene 3: Awakening (0:45)",
    video_scene_4: "Scene 4: Mahavakya (1:08)",
    btn_save_journal: "Save to Journal",
    btn_share_community: "Share in Youth Sangam",
    btn_copy: "Copy Slogan",

    // Community / Sangam
    comm_heading: "Youth Sangam - Be Each Other's Guide",
    comm_subheading: "Every user has a unique account & @handle. Help peers to earn Karma points!",
    comm_filter_all: "All",
    comm_filter_fear: "⚡ Fear & Courage",
    comm_filter_focus: "📱 Focus & Habits",
    comm_filter_unanswered: "⚡ Needs Solutions (+25)",
    posting_as_prefix: "Posting as:",
    anon_toggle_label: "Post Anonymously",
    btn_publish_post: "Post in Sangam (+5 Karma)",
    leaderboard_title: "Top Karma Mentors (Unique Accounts)",
    how_karma_title: "How to Earn Karma Points?",
    how_karma_1: "✅ Provide Solution to a Post: +15 Karma",
    how_karma_2: "✅ Upvoted Solution: +10 Karma per Upvote",
    how_karma_3: "✅ Best Answer Selected: +50 Karma",
    how_karma_4: "✅ Share a Dilemma in Sangam: +5 Karma",

    // Store
    store_hero_title: "Karma Mandir & Saarthi Pass",
    store_hero_desc: "Every new seeker gets 1 Month of AI Mentorship 100% Free. Continue free forever by helping peers with Karma points, or purchase a Saarthi Pass!",
    trial_status_title: "1-Month Free Trial Status",
    trial_remaining: "24 Days Remaining",
    trial_footnote: "Your account never stops after trial — Karma points keep it active free!",
    wallet_label: "Your Karma Balance",
    wallet_sub: "Points earned through peer support & wisdom shares",
    btn_earn_more: "Earn More Points",
    btn_redeem_now: "Redeem Points",
    buy_section_title: "Direct Buy Vivek Saarthi Bot",
    buy_section_desc: "If you lack time to earn points in community, purchase an affordable pass to unlock the bot directly:",
    tier_1_name: "Shishya Pass",
    tier_1_period: "/ month",
    tier_1_feat_1: "Unlimited AI Mentorship",
    tier_1_feat_2: "Swami Vivekananda Baritone Voice",
    tier_1_feat_3: "10 AI Video Capsules / month",
    tier_1_feat_4: "Ad-free experience",
    btn_buy_shishya: "Buy Monthly Pass (₹99)",
    tier_2_tag: "MOST POPULAR • 60% OFF",
    tier_2_name: "Sadhak 3-Month Pass",
    tier_2_period: "/ 3 months",
    tier_2_feat_1: "All Shishya Pass features",
    tier_2_feat_2: "Unlimited HD Video Capsules",
    tier_2_feat_3: "Priority AI Response Speed",
    tier_2_feat_4: "\"Verified Sadhak\" Golden Community Badge",
    tier_2_feat_5: "500 Bonus Karma Points Gifted",
    btn_buy_sadhak: "Buy 3-Month Pass (₹249)",
    tier_3_name: "Saarthi Lifetime Bot",
    tier_3_period: "one-time payment",
    tier_3_feat_1: "Lifetime Unlimited Access Forever",
    tier_3_feat_2: "Ultra HD Vivekananda Voice Clones",
    tier_3_feat_3: "Direct WhatsApp / Telegram Bot Integration",
    tier_3_feat_4: "Lifetime Community Legend Crown 👑",
    btn_buy_lifetime: "Buy Lifetime Pass (₹699)",

    // Auth Modal
    auth_modal_title: "Vivek Saarthi Portal",
    auth_modal_sub: "Login or Register with Mobile, Email, or Google to access your unique Youth Sangam ID",
    tab_mobile_otp: "📱 Mobile OTP",
    tab_password: "🔑 Password",
    tab_otp: "📧 Email OTP",
    tab_register: "📝 Register",
    label_mobile: "10-Digit Mobile Number:",
    btn_send_mobile_otp: "Send OTP",
    mobile_otp_subtext: "📱 Instant SMS verification code for fast 1-click access",
    btn_verify_mobile_otp: "Verify Mobile OTP & Enter Portal",
    label_email: "Your Email Address:",
    btn_send_otp: "Send OTP",
    otp_subtext: "📧 A verification code will be sent instantly to your email inbox",
    label_enter_otp: "Enter 6-Digit OTP:",
    btn_verify_otp: "Verify OTP & Enter Portal",
    label_email_or_user: "Email Address, Mobile, or @Username:",
    label_password: "Password:",
    btn_login: "Login to Portal",
    label_fullname: "Full Name:",
    label_username: "Unique Handle / Username (for Youth Sangam):",
    username_subtext: "Your unique public identity in discussions.",
    btn_register: "Register Unique Account",
    auth_or_divider: "OR",
    btn_google: "Continue with Google (Any Account)",
    btn_continue_guest: "👉 Continue as Guest Seeker (Preview Mode)",

    // Google Modal
    google_modal_title: "Sign in with Google",
    google_modal_sub: "Choose or enter any Google account to sign in or register",
    label_google_name: "Your Name:",
    label_google_email: "Your Google Email Address:",
    btn_google_submit: "Continue as Google User",

    // User Portal Modal
    portal_trial_badge: "🌟 1-Month Free Trial Active",
    stat_karma_balance: "Karma Balance",
    stat_free_trial: "Free Trial Remaining",
    stat_wisdom_capsules: "Wisdom Capsules",
    portal_edit_heading: "✏️ Edit Unique Profile & ID Details",
    portal_name_label: "Your Full Name:",
    portal_handle_label: "Unique Handle (for Youth Sangam discussions):",
    portal_handle_subtext: "Must be unique. Appears on all your Sangam posts and answers.",
    portal_goal_label: "Current Spiritual / Life Focus (Goal):",
    opt_goal_1: "UPSC & Exam Stress Relief",
    opt_goal_2: "Overcoming Phone Addiction & Focus",
    opt_goal_3: "Inner Peace & Heartbreak Healing",
    opt_goal_4: "Physical Strength & Discipline",
    opt_goal_5: "Finding Life Purpose & Dharma",
    portal_bio_label: "Your Bio / Personal Note:",
    portal_avatar_label: "Select Avatar Icon:",
    btn_save_profile: "💾 Save Profile Changes",
    btn_logout: "🚪 Log Out",

    // Video Settings Modal
    video_modal_title: "⚙️ AI Video & Voice Engine API",
    video_modal_sub: "Vivek Saarthi provides built-in generative canvas storyboard rendering, plus plug-and-play API hooks for automated external video & voice generation.",
    video_label_pipeline: "Video Generation Pipeline:",
    video_opt_native: "Native Kinetic Canvas Generator (Built-in • Instant)",
    video_opt_heygen: "HeyGen AI Avatar API (External)",
    video_opt_did: "D-ID Video Generation API (External)",
    video_opt_replicate: "Replicate / Stable Video Diffusion (External)",
    video_label_api_key: "Optional API Key (For External HeyGen / D-ID / ElevenLabs):",
    video_subtext_api_key: "Native engine works 100% out of the box with zero API keys required.",
    video_btn_save: "Apply Settings",

    // Checkout Modal
    checkout_modal_title: "Unlock Vivek Saarthi Pass",
    checkout_modal_sub: "Instant access will be activated on your account",
    checkout_safe_note: "One-time safe transaction",
    checkout_pay_method_label: "Select Payment Method:",
    checkout_pay_upi: "UPI / GPay",
    checkout_pay_card: "Debit/Credit",
    checkout_pay_net: "Net Banking",

    // Past Mentorship & Journey
    history_heading: "My Past Mentorship Sessions (पूर्व मार्गदर्शन यात्रा)",
    history_sub: "Your previous spiritual consultations are permanently saved. Continue where you left off, edit your notes, or share wisdom with peers!",
    history_empty_title: "No Past Sessions Yet",
    history_empty_desc: "Ask any question or dilemma to Swami Vivekananda above. Each wisdom session is automatically recorded here so your guidance cycle never resets!",
    karma_zero_title: "0 Karma Balance Remaining!",
    karma_zero_desc: "Earn +15 Karma by answering questions in Youth Sangam, claim your +50 daily check-in, or top-up.",
    edit_session_modal_title: "Edit Mentorship Session & Notes",
    edit_session_modal_sub: "Update your question or record your personal sadhana reflections",
    label_edit_query: "Life Dilemma / Question:",
    label_edit_notes: "Your Personal Sadhana Notes / Reflections:",
    btn_save_session: "💾 Save Changes to Journey",
    comm_acc_modal_title: "Youth Sangam Account Switcher",
    comm_acc_modal_sub: "Create multiple community personas or switch between your accounts",
    label_comm_fullname: "Display Name:",
    label_comm_username: "Unique Sangam Handle:",
    label_comm_avatar: "Select Avatar:",
    label_comm_bio: "Short Bio / Sangam Role:",
    btn_create_comm_account: "🚀 Create & Switch to Account (+350 Karma)"
  },

  hindi: {
    // Brand
    brand_title_latin: "विवेक",
    brand_title_hindi: "साथी",
    brand_subtitle: "एआई मार्गदर्शक एवं युवा संगम",

    // Nav
    nav_mentorship: "विवेक वाणी (मार्गदर्शन)",
    nav_community: "युवा संगम",
    nav_store: "कर्म मंदिर एवं स्टोर",
    auth_btn_login: "लॉगिन / पंजीकरण",

    // Hero
    hero_pill: "स्वामी विवेकानंद ज्ञान इंजन एवं वाणी एआई",
    hero_title_1: "उत्तिष्ठत जाग्रत!",
    hero_title_2: "प्रत्येक दुविधा में दिव्य मार्गदर्शन प्राप्त करें।",
    hero_desc: "अपनी जीवन परिस्थिति साझा करें — हमारा एआई मॉडल स्वामी विवेकानंद के जीवन की प्रामाणिक कथाएं, ओजस्वी संस्कृत श्लोक, गंभीर वाणी में मार्गदर्शन एवं वीडियो प्रस्तुत करता है। युवा संगम में साथियों की सहायता कर कर्म अंक अर्जित करें!",
    stat_free: "1 माह निःशुल्क सेवा",
    stat_youth: "मार्गदर्शित युवा",
    stat_karma: "अर्जित कर्म अंक",
    badge_voice_title: "स्वामी विवेकानंद गंभीर वाणी",
    badge_voice_sub: "प्रामाणिक कथाएं एवं श्लोक",
    badge_sangam_title: "विशिष्ट संगम खाते",
    badge_sangam_sub: "अद्वितीय @हैंडल एवं कर्म",

    // Mentorship Form
    form_title: "अपनी परिस्थिति साझा करें",
    form_subtitle: "एआई मॉडल स्वामी विवेकानंद के प्रेरक प्रसंगों एवं श्लोकों से समाधान देगा",
    quick_topics_label: "सामान्य जीवन दुविधाएं:",
    chip_fear: "⚡ असफलता का भय एवं परीक्षा तनाव",
    chip_discipline: "📱 मोबाइल लत एवं एकाग्रता की कमी",
    chip_breakup: "💔 उपेक्षा एवं हीनभावना",
    chip_strength: "🏋️ शारीरिक एवं मानसिक दुर्बलता",
    chip_purpose: "🧭 जीवन लक्ष्य एवं दिशा का अभाव",
    btn_generate: "स्वामी जी की कथा, श्लोक एवं वाणी सुनें",
    guarantee_text: "100% गोपनीय एवं सुरक्षित",
    api_settings_link: "⚙️ वीडियो एवं वाणी एपीआई सेटिंग्स",

    // Mentorship Result States
    empty_title: "आपका मार्गदर्शन यहाँ प्रकट होगा",
    empty_desc: "बाईं ओर अपनी स्थिति लिखें या माइक का प्रयोग करें। एआई प्रामाणिक कथा, महावाक्य श्लोक, गंभीर वाणी एवं वीडियो तैयार करेगा।",
    processing_title: "स्वामी विवेकानंद के विचारों का अनुशीलन जारी है...",
    processing_desc: "एनएलपी मॉडल सक्रिय • प्रामाणिक प्रसंग चयन • गंभीर वाणी संश्लेषण • वीडियो निर्माण",
    result_badge: "विवेक साथी मार्गदर्शन संपुट",
    karma_awarded_tag: "⚡ +10 कर्म अंक प्राप्त",
    story_badge: "📖 स्वामी विवेकानंद का प्रामाणिक जीवन प्रसंग",
    lesson_prefix: "जीवन का पाठ:",
    voice_title: "स्वामी विवेकानंद की गंभीर वाणी में श्रवण करें",
    voice_subtitle: "ओजस्वी गंभीर एआई वाणी • कथा वाचन एवं श्लोक",
    video_badge: "एआई वीडियो कथा संपुट",
    video_scene_1: "दृश्य 1: मन की दुविधा (0:00)",
    video_scene_2: "दृश्य 2: प्रेरक प्रसंग (0:22)",
    video_scene_3: "दृश्य 3: आत्म-जागरण (0:45)",
    video_scene_4: "दृश्य 4: महावाक्य (1:08)",
    btn_save_journal: "दैनिकी में सहेजें",
    btn_share_community: "युवा संगम में साझा करें",
    btn_copy: "श्लोक कॉपी करें",

    // Community / Sangam
    comm_heading: "युवा संगम - एक दूसरे के पथप्रदर्शक बनें",
    comm_subheading: "प्रत्येक साधक का अद्वितीय खाता व @हैंडल है। साथियों की सहायता कर कर्म अंक अर्जित करें!",
    comm_filter_all: "सभी",
    comm_filter_fear: "⚡ भय एवं साहस",
    comm_filter_focus: "📱 एकाग्रता एवं आदतें",
    comm_filter_unanswered: "⚡ समाधान अपेक्षित (+25)",
    posting_as_prefix: "पोस्ट कर्ता:",
    anon_toggle_label: "गुमनाम रूप से पोस्ट करें",
    btn_publish_post: "संगम में साझा करें (+5 कर्म)",
    leaderboard_title: "शीर्ष कर्म मार्गदर्शक (विशिष्ट खाते)",
    how_karma_title: "कर्म अंक कैसे अर्जित करें?",
    how_karma_1: "✅ किसी पोस्ट पर समाधान दें: +15 कर्म",
    how_karma_2: "✅ समाधान पर समर्थन (अपवोट): +10 कर्म",
    how_karma_3: "✅ सर्वश्रेष्ठ उत्तर चयनित: +50 कर्म",
    how_karma_4: "✅ संगम में अपनी दुविधा पूछें: +5 कर्म",

    // Store
    store_hero_title: "कर्म मंदिर एवं साथी पास",
    store_hero_desc: "प्रत्येक नए साधक को 1 माह का एआई मार्गदर्शन पूर्णतः निःशुल्क मिलता है। युवा संगम में साथियों की सहायता कर आजीवन निःशुल्क सेवा प्राप्त करें, अथवा साथी पास खरीदें!",
    trial_status_title: "1-माह निःशुल्क परीक्षण स्थिति",
    trial_remaining: "24 दिन शेष",
    trial_footnote: "परीक्षण समाप्त होने पर भी सेवा नहीं रुकती — कर्म अंक इसे निःशुल्क सक्रिय रखते हैं!",
    wallet_label: "आपका कर्म संतुलन",
    wallet_sub: "साथियों की सहायता एवं ज्ञान चर्चा से अर्जित अंक",
    btn_earn_more: "और अंक अर्जित करें",
    btn_redeem_now: "अंक भुनाएं",
    buy_section_title: "विवेक साथी बॉट सीधे खरीदें",
    buy_section_desc: "यदि आपके पास संगम में अंक कमाने का समय नहीं है, तो सुलभ मूल्य पर साथी पास प्राप्त करें:",
    tier_1_name: "शिष्य पास",
    tier_1_period: "/ माह",
    tier_1_feat_1: "असीमित एआई मार्गदर्शन",
    tier_1_feat_2: "स्वामी विवेकानंद गंभीर वाणी",
    tier_1_feat_3: "10 एआई वीडियो कथा संपुट / माह",
    tier_1_feat_4: "विज्ञापन-मुक्त अनुभव",
    btn_buy_shishya: "मासिक पास खरीदें (₹99)",
    tier_2_tag: "सर्वाधिक लोकप्रिय • 60% छूट",
    tier_2_name: "साधक 3-माह पास",
    tier_2_period: "/ 3 माह",
    tier_2_feat_1: "समस्त शिष्य पास सुविधाएं",
    tier_2_feat_2: "असीमित एचडी वीडियो संपुट",
    tier_2_feat_3: "अतिशीघ्र एआई प्रत्युत्तर",
    tier_2_feat_4: "\"प्रमाणित साधक\" स्वर्णिम संगम पदक",
    tier_2_feat_5: "500 बोनस कर्म अंक उपहार",
    btn_buy_sadhak: "3-माह पास खरीदें (₹249)",
    tier_3_name: "साथी आजीवन बॉट",
    tier_3_period: "एकमुश्त भुगतान",
    tier_3_feat_1: "आजीवन असीमित पहुंच",
    tier_3_feat_2: "अल्ट्रा एचडी विवेकानंद वाणी क्लोन",
    tier_3_feat_3: "सीधा व्हाट्सएप / टेलीग्राम बॉट एकीकरण",
    tier_3_feat_4: "आजीवन संगम रत्न मुकुट 👑",
    btn_buy_lifetime: "आजीवन पास खरीदें (₹699)",

    // Auth Modal
    auth_modal_title: "विवेक साथी प्रवेश द्वार",
    auth_modal_sub: "मोबाइल, ईमेल अथवा गूगल द्वारा लॉगिन या पंजीकरण कर विशिष्ट युवा संगम आईडी प्राप्त करें",
    tab_mobile_otp: "📱 मोबाइल ओटीपी",
    tab_password: "🔑 पासवर्ड",
    tab_otp: "📧 ईमेल ओटीपी",
    tab_register: "📝 नया पंजीकरण",
    label_mobile: "10-अंकों का मोबाइल नंबर:",
    btn_send_mobile_otp: "ओटीपी भेजें",
    mobile_otp_subtext: "📱 त्वरित 1-क्लिक प्रवेश हेतु एसएमएस कोड",
    btn_verify_mobile_otp: "ओटीपी सत्यापित कर प्रवेश करें",
    label_email: "आपका ईमेल पता:",
    btn_send_otp: "ओटीपी भेजें",
    otp_subtext: "📧 आपके ईमेल इनबॉक्स में सत्यापन कोड तुरंत भेजा जाएगा",
    label_enter_otp: "6-अंकों का ओटीपी दर्ज करें:",
    btn_verify_otp: "ओटीपी सत्यापित कर प्रवेश करें",
    label_email_or_user: "ईमेल पता, मोबाइल अथवा @यूजरनेम:",
    label_password: "पासवर्ड:",
    btn_login: "पोर्टल में लॉगिन करें",
    label_fullname: "पूरा नाम:",
    label_username: "अद्वितीय हैंडल / यूजरनेम (युवा संगम हेतु):",
    username_subtext: "चर्चाओं में आपकी विशिष्ट सार्वजनिक पहचान।",
    btn_register: "विशिष्ट खाता पंजीकृत करें",
    auth_or_divider: "अथवा",
    btn_google: "गूगल द्वारा जारी रखें (कोई भी खाता)",
    btn_continue_guest: "👉 अतिथि साधक के रूप में आगे बढ़ें (पूर्वावलोकन)",

    // Google Modal
    google_modal_title: "गूगल से लॉगिन करें",
    google_modal_sub: "प्रवेश अथवा पंजीकरण हेतु कोई भी गूगल खाता चुनें या दर्ज करें",
    label_google_name: "आपका नाम:",
    label_google_email: "आपका गूगल ईमेल पता:",
    btn_google_submit: "गूगल साधक के रूप में आगे बढ़ें",

    // User Portal Modal
    portal_trial_badge: "🌟 1-माह निःशुल्क सेवा सक्रिय",
    stat_karma_balance: "कर्म संतुलन",
    stat_free_trial: "निःशुल्क सेवा शेष",
    stat_wisdom_capsules: "ज्ञान संपुट",
    portal_edit_heading: "✏️ विशिष्ट प्रोफ़ाइल एवं पहचान विवरण संपादित करें",
    portal_name_label: "आपका पूरा नाम:",
    portal_handle_label: "विशिष्ट हैंडल (युवा संगम चर्चाओं हेतु):",
    portal_handle_subtext: "विशिष्ट होना आवश्यक है। आपके समस्त संगम पोस्ट एवं उत्तरों पर प्रदर्शित होगा।",
    portal_goal_label: "वर्तमान आध्यात्मिक / जीवन लक्ष्य (उद्देश्य):",
    opt_goal_1: "सिविल सेवा एवं परीक्षा तनाव मुक्ति",
    opt_goal_2: "मोबाइल लत मुक्ति एवं एकाग्रता",
    opt_goal_3: "आत्मिक शांति एवं हृदय-पीड़ा निवारण",
    opt_goal_4: "शारीरिक सामर्थ्य एवं अनुशासन",
    opt_goal_5: "जीवन लक्ष्य एवं स्वधर्म की खोज",
    portal_bio_label: "आपका परिचय / आत्म-कथन:",
    portal_avatar_label: "अवतार चिह्न चुनें:",
    btn_save_profile: "💾 परिवर्तन सहेजें",
    btn_logout: "🚪 लॉग आउट",

    // Video Settings Modal
    video_modal_title: "⚙️ एआई वीडियो एवं वाणी इंजन सेटिंग्स",
    video_modal_sub: "विवेक साथी में इन-बिल्ट काइनेटिक स्टोरीबोर्ड के साथ बाहरी वीडियो एवं वाणी एपीआई हुक उपलब्ध हैं।",
    video_label_pipeline: "वीडियो निर्माण इंजन:",
    video_opt_native: "इन-बिल्ट काइनेटिक कैनवास जनरेटर (तात्कालिक)",
    video_opt_heygen: "हे-जेन एआई अवतार एपीआई (बाहरी)",
    video_opt_did: "डी-आईडी वीडियो जनरेशन एपीआई (बाहरी)",
    video_opt_replicate: "रेप्लिकेट / स्टेबल वीडियो डिफ्यूजन (बाहरी)",
    video_label_api_key: "वैकल्पिक एपीआई कुंजी (बाहरी सेवाओं हेतु):",
    video_subtext_api_key: "इन-बिल्ट इंजन बिना किसी एपीआई कुंजी के 100% सुचारु रूप से कार्य करता है।",
    video_btn_save: "सेटिंग्स लागू करें",

    // Checkout Modal
    checkout_modal_title: "विवेक साथी पास सक्रिय करें",
    checkout_modal_sub: "आपके खाते पर तत्काल सेवा सक्रिय कर दी जाएगी",
    checkout_safe_note: "एकमुश्त सुरक्षित लेन-देन",
    checkout_pay_method_label: "भुगतान विधि चुनें:",
    checkout_pay_upi: "यूपीआई / जी-पे",
    checkout_pay_card: "डेबिट / क्रेडिट कार्ड",
    checkout_pay_net: "नेट बैंकिंग",

    // Past Mentorship & Journey
    history_heading: "मेरी पूर्व मार्गदर्शन यात्रा (सत्र इतिहास)",
    history_sub: "आपके पूर्व आध्यात्मिक परामर्श स्थायी रूप से सुरक्षित हैं। वहीं से आगे बढ़ें, टिप्पणियां संपादित करें या साथियों से साझा करें!",
    history_empty_title: "अभी तक कोई पूर्व सत्र नहीं है",
    history_empty_desc: "ऊपर स्वामी विवेकानंद जी से अपनी कोई भी दुविधा पूछें। प्रत्येक सत्र यहाँ स्वतः सुरक्षित हो जाता है ताकि आपकी यात्रा बनी रहे!",
    karma_zero_title: "0 कर्म शेष हैं!",
    karma_zero_desc: "युवा संगम में उत्तर देकर +15 कर्म अंक अर्जित करें, +50 दैनिक साधना बोनस लें, या स्टोर देखें।",
    edit_session_modal_title: "सत्र एवं साधना टिप्पणियां संपादित करें",
    edit_session_modal_sub: "अपना प्रश्न अद्यतन करें अथवा व्यक्तिगत साधना विचार लिखें",
    label_edit_query: "जीवन की दुविधा अथवा प्रश्न:",
    label_edit_notes: "आपकी व्यक्तिगत साधना टिप्पणियां:",
    btn_save_session: "💾 यात्रा में परिवर्तन सहेजें",
    comm_acc_modal_title: "युवा संगम खाता एवं पहचान परिवर्तक",
    comm_acc_modal_sub: "अनेक संगम पहचान बनाएं अथवा अपने खातों के बीच स्विच करें",
    label_comm_fullname: "प्रदर्शित नाम:",
    label_comm_username: "अद्वितीय संगम हैंडल:",
    label_comm_avatar: "अवतार चुनें:",
    label_comm_bio: "संक्षिप्त परिचय / संगम भूमिका:",
    btn_create_comm_account: "🚀 बनाएं एवं इस खाते पर स्विच करें (+350 कर्म)"
  },

  hinglish: {
    // Brand
    brand_title_latin: "Vivek",
    brand_title_hindi: "साथी",
    brand_subtitle: "AI Mentor & Youth Sangam",

    // Nav
    nav_mentorship: "Vivek Vani (AI Mentor)",
    nav_community: "Youth Sangam",
    nav_store: "Karma & Pro Store",
    auth_btn_login: "Login / Register",

    // Hero
    hero_pill: "Swami Vivekananda NLP Wisdom Engine & Voice AI",
    hero_title_1: "Utho, Jaago!",
    hero_title_2: "Har Dilemma me Swami ji ka Divine Guidance Paayein.",
    hero_desc: "Apni life situation share karein — hamara AI model Swami Vivekananda ji ki real stories, shaktishaali Sanskrit slogans, baritone voice guidance aur video capsules provide karta hai. Community me logon ki madad karke Karma points kamayein!",
    stat_free: "1 Month Free Access",
    stat_youth: "Youth Mentored",
    stat_karma: "Karma Points Earned",
    badge_voice_title: "Vivekananda Baritone Voice",
    badge_voice_sub: "Authentic Stories & Slogans",
    badge_sangam_title: "Unique Sangam Accounts",
    badge_sangam_sub: "Unique @handles & Karma",

    // Mentorship Form
    form_title: "Apni Situation Share Karein",
    form_subtitle: "AI model Swami Vivekananda ji ki stories aur slogans se guide karega",
    quick_topics_label: "Aam Jeevan Ki Duwidhaayein:",
    chip_fear: "⚡ Failure Ka Darr & Exam Anxiety",
    chip_discipline: "📱 Phone Addiction & Kam Focus",
    chip_breakup: "💔 Rejection & Low Self-Esteem",
    chip_strength: "🏋️ Shareer & Mann Ki Kamzori",
    chip_purpose: "🧭 Jeevan Ka Lakshya & Direction",
    btn_generate: "Swami ji Ki Story, Slogan & Voice Sunein",
    guarantee_text: "100% Confidential & Secure",
    api_settings_link: "⚙️ Video & Voice API Settings",

    // Mentorship Result States
    empty_title: "Aapka Guidance Yahan Manifest Hoga",
    empty_desc: "Left side me apni situation likhein ya mic use karein. AI authentic story, mahavakya slogan, baritone voice aur video capsule taiyar karega.",
    processing_title: "Swami Vivekananda Ji Ke Vichar Consult Ho Rahe Hain...",
    processing_desc: "NLP model running • Real story matching • Baritone voice synthesize ho rahi hai • Video taiyar ho raha hai",
    result_badge: "Vivek Saarthi Guidance Capsule",
    karma_awarded_tag: "⚡ +10 Karma Awarded",
    story_badge: "📖 Swami Vivekananda Ji Ki Real Story",
    lesson_prefix: "Jeevan Ka Path:",
    voice_title: "Swami Vivekananda Ji Ki Baritone Voice Me Sunein",
    voice_subtitle: "Deep Baritone AI Voice • Story Narration & Slogan",
    video_badge: "AI Video Storyboard Capsule",
    video_scene_1: "Scene 1: Dilemma (0:00)",
    video_scene_2: "Scene 2: Story Parable (0:22)",
    video_scene_3: "Scene 3: Awakening (0:45)",
    video_scene_4: "Scene 4: Mahavakya (1:08)",
    btn_save_journal: "Journal Me Save Karein",
    btn_share_community: "Youth Sangam Me Share Karein",
    btn_copy: "Slogan Copy Karein",

    // Community / Sangam
    comm_heading: "Youth Sangam - Ek Doosre Ke Saarthi Banein",
    comm_subheading: "Har user ka unique account aur @handle hai. Ek dusre ki madad karke Karma points kamayein!",
    comm_filter_all: "All",
    comm_filter_fear: "⚡ Darr Aur Sahas",
    comm_filter_focus: "📱 Focus Aur Aadat",
    comm_filter_unanswered: "⚡ Solution Chahiye (+25)",
    posting_as_prefix: "Post karne wale:",
    anon_toggle_label: "Anonymous Post Karein",
    btn_publish_post: "Sangam Me Post Karein (+5 Karma)",
    leaderboard_title: "Top Karma Mentors (Unique Accounts)",
    how_karma_title: "Karma Points Kaise Kamayein?",
    how_karma_1: "✅ Post par Solution dein: +15 Karma",
    how_karma_2: "✅ Solution Upvote hone par: +10 Karma",
    how_karma_3: "✅ Best Answer banne par: +50 Karma",
    how_karma_4: "✅ Sangam me duvidha puchhne par: +5 Karma",

    // Store
    store_hero_title: "Karma Mandir & Saarthi Pass",
    store_hero_desc: "Har naye seeker ko 1 Month AI Mentorship 100% Free milti hai. Community me logon ki help karke lifetime free rakhein ya Saarthi Pass purchase karein!",
    trial_status_title: "1-Month Free Trial Status",
    trial_remaining: "24 Days Remaining",
    trial_footnote: "Trial ke baad bhi account band nahi hota — Karma points se yeh free chalta rahega!",
    wallet_label: "Aapka Karma Balance",
    wallet_sub: "Community me help aur wisdom share karne se kamaye points",
    btn_earn_more: "Aur Points Kamayein",
    btn_redeem_now: "Points Redeem Karein",
    buy_section_title: "Vivek साथी Bot Direct Buy Karein",
    buy_section_desc: "Agar community me points kamane ka samay kam hai, toh affordable pass se bot direct unlock karein:",
    tier_1_name: "Shishya Pass",
    tier_1_period: "/ month",
    tier_1_feat_1: "Unlimited AI Mentorship",
    tier_1_feat_2: "Swami Vivekananda Baritone Voice",
    tier_1_feat_3: "10 AI Video Capsules / month",
    tier_1_feat_4: "Ad-free experience",
    btn_buy_shishya: "Monthly Pass Buy Karein (₹99)",
    tier_2_tag: "MOST POPULAR • 60% OFF",
    tier_2_name: "Sadhak 3-Month Pass",
    tier_2_period: "/ 3 months",
    tier_2_feat_1: "Sabhi Shishya Pass features",
    tier_2_feat_2: "Unlimited HD Video Capsules",
    tier_2_feat_3: "Priority AI Response Speed",
    tier_2_feat_4: "\"Verified Sadhak\" Golden Community Badge",
    tier_2_feat_5: "500 Bonus Karma Points Gifted",
    btn_buy_sadhak: "3-Month Pass Buy Karein (₹249)",
    tier_3_name: "Saarthi Lifetime Bot",
    tier_3_period: "one-time payment",
    tier_3_feat_1: "Lifetime Unlimited Access Forever",
    tier_3_feat_2: "Ultra HD Vivekananda Voice Clones",
    tier_3_feat_3: "Direct WhatsApp / Telegram Bot Integration",
    tier_3_feat_4: "Lifetime Community Legend Crown 👑",
    btn_buy_lifetime: "Lifetime Pass Buy Karein (₹699)",

    // Auth Modal
    auth_modal_title: "Vivek साथी Portal",
    auth_modal_sub: "Apne unique Youth Sangam ID access karne ke liye Mobile, Email ya Google se login karein",
    tab_mobile_otp: "📱 Mobile OTP",
    tab_password: "🔑 Password",
    tab_otp: "📧 Email OTP",
    tab_register: "📝 Register",
    label_mobile: "10-Digit Mobile Number:",
    btn_send_mobile_otp: "Send OTP",
    mobile_otp_subtext: "📱 Instant SMS verification code for fast 1-click access",
    btn_verify_mobile_otp: "Verify Mobile OTP & Enter Portal",
    label_email: "Aapka Email Address:",
    btn_send_otp: "Send OTP",
    otp_subtext: "📧 Aapke email inbox me verification code turant bheja jayega",
    label_enter_otp: "6-Digit OTP Enter Karein:",
    btn_verify_otp: "Verify OTP & Enter Portal",
    label_email_or_user: "Email Address, Mobile ya @Username:",
    label_password: "Password:",
    btn_login: "Portal Me Login Karein",
    label_fullname: "Poora Naam:",
    label_username: "Unique Handle / Username (Youth Sangam ke liye):",
    username_subtext: "Discussions me aapki unique public identity.",
    btn_register: "Unique Account Register Karein",
    auth_or_divider: "OR",
    btn_google: "Google Se Continue Karein (Any Account)",
    btn_continue_guest: "👉 Continue as Guest Seeker (Preview Mode)",

    // Google Modal
    google_modal_title: "Google Se Sign In Karein",
    google_modal_sub: "Login ya register karne ke liye koi bhi Google account enter karein",
    label_google_name: "Aapka Naam:",
    label_google_email: "Aapka Google Email Address:",
    btn_google_submit: "Google User Ke Roop Me Continue Karein",

    // User Portal Modal
    portal_trial_badge: "🌟 1-Month Free Trial Active",
    stat_karma_balance: "Karma Balance",
    stat_free_trial: "Free Trial Remaining",
    stat_wisdom_capsules: "Wisdom Capsules",
    portal_edit_heading: "✏️ Unique Profile & ID Details Edit Karein",
    portal_name_label: "Aapka Poora Naam:",
    portal_handle_label: "Unique Handle (Youth Sangam discussions ke liye):",
    portal_handle_subtext: "Unique hona zaroori hai. Aapke sabhi Sangam posts aur answers par dikhega.",
    portal_goal_label: "Current Spiritual / Life Focus (Lakshya):",
    opt_goal_1: "UPSC & Exam Stress Relief",
    opt_goal_2: "Overcoming Phone Addiction & Focus",
    opt_goal_3: "Inner Peace & Heartbreak Healing",
    opt_goal_4: "Physical Strength & Discipline",
    opt_goal_5: "Finding Life Purpose & Dharma",
    portal_bio_label: "Aapka Bio / Personal Note:",
    portal_avatar_label: "Avatar Icon Select Karein:",
    btn_save_profile: "💾 Profile Changes Save Karein",
    btn_logout: "🚪 Log Out",

    // Video Settings Modal
    video_modal_title: "⚙️ AI Video & Voice Engine API",
    video_modal_sub: "Vivek साथी built-in canvas storyboard ke sath external video & voice API provide karta hai.",
    video_label_pipeline: "Video Generation Pipeline:",
    video_opt_native: "Native Kinetic Canvas Generator (Built-in • Instant)",
    video_opt_heygen: "HeyGen AI Avatar API (External)",
    video_opt_did: "D-ID Video Generation API (External)",
    video_opt_replicate: "Replicate / Stable Video Diffusion (External)",
    video_label_api_key: "Optional API Key (External HeyGen / D-ID / ElevenLabs ke liye):",
    video_subtext_api_key: "Native engine 100% bina kisi API key ke chalega.",
    video_btn_save: "Apply Settings",

    // Checkout Modal
    checkout_modal_title: "Vivek साथी Pass Unlock Karein",
    checkout_modal_sub: "Instant access activate ho jayega aapke account par",
    checkout_safe_note: "One-time safe transaction",
    checkout_pay_method_label: "Payment Method Select Karein:",
    checkout_pay_upi: "UPI / GPay",
    checkout_pay_card: "Debit/Credit",
    checkout_pay_net: "Net Banking",

    // Past Mentorship & Journey
    history_heading: "My Past Mentorship Sessions (पूर्व मार्गदर्शन यात्रा)",
    history_sub: "Aapke previous spiritual consultations permanently saved hain. Wahin se continue karein, notes edit karein ya share karein!",
    history_empty_title: "Abhi koi previous session nahi hai",
    history_empty_desc: "Upar Swami Vivekananda ji se sawal puchein. Har session automatically yahan save hota hai taaki guidance cycle update rahe!",
    karma_zero_title: "0 Karma Balance Remaining!",
    karma_zero_desc: "Youth Sangam me answers dekar +15 Karma earn karein, +50 daily check-in claim karein ya store dekhein.",
    edit_session_modal_title: "Edit Mentorship Session & Notes",
    edit_session_modal_sub: "Apna question ya personal reflection notes update karein",
    label_edit_query: "Life Dilemma / Question:",
    label_edit_notes: "Aapke Personal Sadhana Notes / Reflections:",
    btn_save_session: "💾 Save Changes to Journey",
    comm_acc_modal_title: "Youth Sangam Account Switcher",
    comm_acc_modal_sub: "Multiple community identities banayein ya accounts ke beech switch karein",
    label_comm_fullname: "Display Name:",
    label_comm_username: "Unique Sangam Handle:",
    label_comm_avatar: "Select Avatar:",
    label_comm_bio: "Short Bio / Sangam Role:",
    btn_create_comm_account: "🚀 Create & Switch to Account (+350 Karma)"
  }
};

const Placeholders = {
  english: {
    userSituationInput: "e.g. 'I have been preparing for competitive exams for 2 years without success. Feeling overwhelmed by fear of failure and losing focus...'",
    newCommunityPostText: "Share your dilemma or question... (e.g. 'How to overcome anxiety and build consistency?')",
    authMobileTargetInput: "e.g. 9876543210",
    authMobileOtpCodeInput: "Enter 6-digit code (e.g. 123456)",
    authOtpTargetInput: "e.g. yourname@gmail.com",
    authOtpCodeInput: "Enter 6-digit code (e.g. 123456)",
    loginIdentifierInput: "Enter email, mobile or username",
    loginPasswordInput: "Enter password",
    regNameInput: "e.g. Aarav Sharma",
    regUsernameInput: "e.g. aarav_sharma (will appear as @aarav_sharma)",
    regEmailInput: "e.g. aarav@gmail.com",
    regMobileInput: "e.g. 9876543210",
    regPasswordInput: "At least 6 characters",
    googleUserNameInput: "e.g. Aarav Sharma",
    googleUserEmailInput: "e.g. any_user@gmail.com"
  },
  hindi: {
    userSituationInput: "उदा. 'मैं 2 वर्षों से प्रतियोगी परीक्षा की तैयारी कर रहा हूँ किंतु सफलता नहीं मिली। असफलता के भय से घबराया हुआ हूँ और मन एकाग्र नहीं हो रहा...'",
    newCommunityPostText: "अपनी दुविधा या प्रश्न साझा करें... (उदा. 'तनाव को दूर कर निरंतरता कैसे बनाएं?')",
    authMobileTargetInput: "उदा. 9876543210",
    authMobileOtpCodeInput: "6-अंकों का कोड दर्ज करें (उदा. 123456)",
    authOtpTargetInput: "उदा. aapkanaam@gmail.com",
    authOtpCodeInput: "6-अंकों का कोड दर्ज करें (उदा. 123456)",
    loginIdentifierInput: "ईमेल, मोबाइल अथवा यूजरनेम दर्ज करें",
    loginPasswordInput: "पासवर्ड दर्ज करें",
    regNameInput: "उदा. आरव शर्मा",
    regUsernameInput: "उदा. aarav_sharma (@aarav_sharma के रूप में दिखेगा)",
    regEmailInput: "उदा. aarav@gmail.com",
    regMobileInput: "उदा. 9876543210",
    regPasswordInput: "कम से कम 6 अक्षर",
    googleUserNameInput: "उदा. आरव शर्मा",
    googleUserEmailInput: "उदा. koi_bhi_user@gmail.com"
  },
  hinglish: {
    userSituationInput: "e.g. 'Mai 2 saal se competitive exams ki tayari kar raha hoon par safalta nahi mili. Darr lag raha hai aur focus nahi ban pa raha...'",
    newCommunityPostText: "Apni duvidha ya sawal likhein... (e.g. 'Anxiety kaise door karein aur consistency kaise layein?')",
    authMobileTargetInput: "e.g. 9876543210",
    authMobileOtpCodeInput: "6-digit code enter karein (e.g. 123456)",
    authOtpTargetInput: "e.g. yourname@gmail.com",
    authOtpCodeInput: "6-digit code enter karein (e.g. 123456)",
    loginIdentifierInput: "Email, mobile ya username enter karein",
    loginPasswordInput: "Password enter karein",
    regNameInput: "e.g. Aarav Sharma",
    regUsernameInput: "e.g. aarav_sharma (@aarav_sharma dikhega)",
    regEmailInput: "e.g. aarav@gmail.com",
    regMobileInput: "e.g. 9876543210",
    regPasswordInput: "Kam se kam 6 characters",
    googleUserNameInput: "e.g. Aarav Sharma",
    googleUserEmailInput: "e.g. any_user@gmail.com"
  }
};

const PresetPrompts = {
  english: {
    fear: "I have failed competitive exams twice and am terrified of the next attempt. Feeling overwhelmed by fear and cannot focus.",
    discipline: "I sit down to study in the morning, but end up wasting the entire day scrolling reels on my phone. Feeling zero discipline.",
    breakup: "After my relationship ended, I feel deeply inferior and broken inside. My self-respect is shattered and I feel worthless.",
    strength: "I feel completely drained physically and mentally every day, trapped in constant lethargy, fatigue and weakness.",
    purpose: "I have no clear sense of direction or purpose in life. Feeling completely lost and confused about my future."
  },
  hindi: {
    fear: "मैं प्रतियोगी परीक्षा में 2 बार असफल हो चुका हूँ, अगले प्रयास से अत्यंत भयभीत हूँ और लग रहा है कि मुझसे कुछ नहीं होगा।",
    discipline: "प्रातःकाल अध्ययन करने बैठता हूँ किंतु मोबाइल रील्स देखते-देखते पूरा दिन व्यर्थ चला जाता है, घोर अनुशासनहीनता महसूस हो रही है।",
    breakup: "संबंध टूटने के बाद मैं अत्यधिक हीनभावना और आत्मग्लानि से ग्रस्त हूँ, मेरा आत्मसम्मान बिखर चुका है।",
    strength: "शरीर और मन में बिल्कुल ऊर्जा नहीं रहती, दिनभर आलस्य और कमजोरी का अनुभव होता है।",
    purpose: "मुझे समझ नहीं आ रहा कि मेरे जीवन का वास्तविक उद्देश्य क्या है, लक्ष्यहीन और दिग्भ्रमित अनुभव कर रहा हूँ।"
  },
  hinglish: {
    fear: "Exam me 2 baar fail ho chuka hoon, agle attempt se bohot darr lag raha hai aur lagta hai mai kuch nahi kar paunga.",
    discipline: "Subah padhne baithta hoon aur phone par reels dekhte dekhte pura din chala jaata hai, zero discipline feel ho raha hai.",
    breakup: "Meri relationship khatam hone ke baad bohot inferior feel ho raha hai, self-respect toot chuki hai.",
    strength: "Shareer aur mann me bilkul energy nahi lagti, pure din aalsya aur kamzori rehti hai.",
    purpose: "Mujhe samajh nahi aa raha mere jeevan ka asli lakshya kya hai, directionless feel kar raha hoon."
  }
};

const CommunityPostsByLang = {
  english: [
    {
      id: "post_1",
      author: "Rohit Kumar",
      username: "rohit_k",
      avatar: "🦁",
      isAnonymous: false,
      timestamp: "2 hours ago",
      category: "fear",
      categoryLabel: "⚡ Fear & Courage",
      problemText: "I've been preparing for competitive exams for 3 years. Failed borderline twice. Family is asking me to take any random job, but my heart is here. Can't sleep at night and feeling hopeless...",
      aiIntervention: "Face the brutes! Swami Vivekananda faced the aggressive monkeys of Varanasi boldly. Failure is only an examination of your determination.",
      solutions: [
        { id: "s1", author: "Aarav Sharma", username: "aarav_sharma", badge: "⭐ Top Helper", text: "Brother, start 3-4 hours freelance work to ease financial worry. Your confidence and courage will return 2x!", upvotes: 42, isUpvoted: false }
      ]
    },
    {
      id: "post_2",
      author: "Anonymous Seeker",
      username: "anonymous_seeker",
      avatar: "🧘‍♂️",
      isAnonymous: true,
      timestamp: "5 hours ago",
      category: "focus",
      categoryLabel: "📱 Focus & Habits",
      problemText: "Every morning I plan to study, but end up wasting 3 hours scrolling reels on my phone. Focus is down to zero. Any practical spiritual discipline?",
      aiIntervention: "Swami ji shot twelve floating eggshells on a river without a single miss! Concentration is the sole secret of all mastery. Keep your phone outside your room at night.",
      solutions: [
        { id: "s2", author: "Devendra Patil", username: "devendra_p", badge: "Discipline Monk", text: "The 20-minute morning rule: Do not touch any screen before 8 AM. Read one chapter of an inspiring book first.", upvotes: 35, isUpvoted: false }
      ]
    }
  ],
  hindi: [
    {
      id: "post_1",
      author: "रोहित कुमार",
      username: "rohit_k",
      avatar: "🦁",
      isAnonymous: false,
      timestamp: "2 घंटे पहले",
      category: "fear",
      categoryLabel: "⚡ भय एवं साहस",
      problemText: "मैं 3 वर्षों से प्रतियोगी परीक्षा की तैयारी कर रहा हूँ। दो बार कटऑफ के पास आकर रह गया। परिवार अब निजी नौकरी का दबाव बना रहा है। रात को नींद नहीं आती और जीवन व्यर्थ लगने लगा है...",
      aiIntervention: "डटकर सामना करो! स्वामी जी ने काशी के वानरों के आगे सीना तानकर भय को परास्त किया था। असफलता केवल तुम्हारे संकल्प की परीक्षा लेने आती है।",
      solutions: [
        { id: "s1", author: "आरव शर्मा", username: "aarav_sharma", badge: "⭐ शीर्ष सहायक", text: "रोहित भाई, आर्थिक दबाव कम करने के लिए प्रतिदिन 4 घंटे अंशकालिक कार्य करें। आपका आत्मविश्वास दोगुना होकर लौटेगा!", upvotes: 42, isUpvoted: false }
      ]
    },
    {
      id: "post_2",
      author: "गुमनाम साधक",
      username: "anonymous_seeker",
      avatar: "🧘‍♂️",
      isAnonymous: true,
      timestamp: "5 घंटे पहले",
      category: "focus",
      categoryLabel: "📱 एकाग्रता एवं आदतें",
      problemText: "प्रतिदिन सुबह उठकर अध्ययन करने की योजना बनाता हूँ, किंतु मोबाइल रील्स देखते-देखते 3 घंटे बीत जाते हैं। एकाग्रता समाप्त हो चुकी है। कोई व्यावहारिक उपाय बताएं?",
      aiIntervention: "स्वामी जी ने बहती नदी में तैरते 12 में से 12 अंडों के छिलकों पर सटीक निशाना लगाया था! एकाग्रता ही ज्ञान की कुंजी है। रात्रि में फोन कक्ष से बाहर रखें।",
      solutions: [
        { id: "s2", author: "देवेंद्र पाटिल", username: "devendra_p", badge: "अनुशासन साधक", text: "20 मिनट का नियम: प्रातः 8 बजे से पूर्व स्क्रीन को स्पर्श न करें। पहले किसी प्रेरक ग्रंथ का एक अध्याय पढ़ें।", upvotes: 35, isUpvoted: false }
      ]
    }
  ],
  hinglish: [
    {
      id: "post_1",
      author: "Rohit Kumar",
      username: "rohit_k",
      avatar: "🦁",
      isAnonymous: false,
      timestamp: "2 hours ago",
      category: "fear",
      categoryLabel: "⚡ Fear & Courage",
      problemText: "Bhai 3 saal se UPSC prep kar raha hoon. Prelims me 2 baar border line par fail ho gaya. Gharwale ab private job ka bol rahe hain, par mera mann yahi hai. Raat ko neend nahi aati aur lagta hai mai useless hoon...",
      aiIntervention: "Face the brutes! Swami ji ne Kashi ke bandaron ke samne seena taan kar darr ko bhagaya tha. Asafalta sirf sankalp ko parakhne aati hai.",
      solutions: [
        { id: "s1", author: "Aarav Sharma", username: "aarav_sharma", badge: "⭐ Top Helper", text: "Rohit bhai, 4 hrs freelance shuru kar lo to ease financial pressure. Your courage will return 2x!", upvotes: 42, isUpvoted: false }
      ]
    },
    {
      id: "post_2",
      author: "Anonymous Seeker",
      username: "anonymous_seeker",
      avatar: "🧘‍♂️",
      isAnonymous: true,
      timestamp: "5 hours ago",
      category: "focus",
      categoryLabel: "📱 Focus & Habits",
      problemText: "Har roz subah uth kar padhne ka plan karta hoon, par reels dekhte dekhte 3 ghante nikal jaate hain. Focus zero ho gaya hai. Any practical advice?",
      aiIntervention: "Swami ji ne nadi par tairte huye 12 me se 12 nishane lagaye the! Ekagrata hi gyan ki kunji hai. Raat ko phone kamre se bahar rakhein.",
      solutions: [
        { id: "s2", author: "Devendra Patil", username: "devendra_p", badge: "Discipline Monk", text: "Rule of 20 Mins: Subah 8 baje se pehle screen touch mat karo. Read 1 book chapter first.", upvotes: 35, isUpvoted: false }
      ]
    }
  ]
};

// ==========================================
// 2. INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Preload logo and video background assets
  AppState.videoLoadedImage = new Image();
  AppState.videoLoadedImage.src = 'assets/logo.jpg';
  AppState.videoImgVivek = new Image();
  AppState.videoImgVivek.src = 'assets/vivekananda.jpg';
  AppState.videoImgMeditation = new Image();
  AppState.videoImgMeditation.src = 'assets/meditation.jpg';

  // Apply stored language across full page
  applyLanguage(AppState.currentLang, false);

  // Initialize theme (Vedic Saffron & Gold Light / Cosmic Dark)
  initTheme();

  // Pre-load speech synthesis voices for instant accent switching
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }

  // Set default initial guidance so player is ready from first paint
  if (!AppState.currentGuidance) {
    AppState.currentGuidance = getDefaultInitialGuidance();
  }

  // Setup visualizer canvas
  initWaveformVisualizer();

  // Setup video canvas
  initAiVideoCanvas();

  // Initialize multi-lingual HD Video Katha Player
  loadVivekVaniVideo(AppState.currentVideoTheme || 'fear_courage', AppState.currentLang, false);

  const realVideo = document.getElementById('vivekVaniRealVideo');
  if (realVideo) {
    realVideo.addEventListener('play', () => {
      stopVideoPlaybackClean();
      stopAmbientSound();
      const voiceBtn = document.getElementById('voicePlayPauseBtn');
      if (voiceBtn) voiceBtn.innerHTML = '▶';
    });
  }

  // Update User UI (Navbar & Portal)
  updateUserUI();

  // Update Karma Displays
  updateKarmaDisplay();

  // Render initial community feed
  renderCommunityFeed();

  // Sync Dharma Rakshak moderation & blocked defaulters in background
  try {
    fetch('/api/community/moderation')
      .then(r => r.json())
      .then(data => {
        if (data && data.blocked_users) {
          AppState.blockedUsersSet = new Set(data.blocked_users.map(u => (u.username || '').toLowerCase()));
          renderCommunityFeed();
          if (isCurrentUserBlocked()) updateUserUI();
        }
      })
      .catch(() => {});
  } catch (e) {}

  // Initialize Speech Recognition if supported
  initSpeechRecognition();

  // If user is logged in, fetch previous mentorship sessions
  if (AppState.currentUser) {
    fetchAndRenderPastSessions();
  }

  // If user is not logged in, present Login Gateway page first
  if (!AppState.currentUser) {
    setTimeout(() => {
      openAuthModal();
    }, 450);
  }
});

// ==========================================
// 3. MULTI-METHOD AUTHENTICATION (MOBILE OTP, PASSWORD, EMAIL OTP, GOOGLE)
// ==========================================
function handleAuthPortalClick() {
  if (AppState.currentUser) {
    openUserPortalModal();
  } else {
    openAuthModal();
  }
}

function openAuthModal() {
  document.getElementById('authModalOverlay')?.classList.add('open');
}

function closeAuthModal() {
  document.getElementById('authModalOverlay')?.classList.remove('open');
}

function continueAsGuest() {
  closeAuthModal();
  const lang = AppState.currentLang || 'hinglish';
  const msgs = {
    english: "Exploring Vivek Saarthi as Guest Seeker",
    hindi: "अतिथि साधक के रूप में विवेक साथी का पूर्वावलोकन जारी है",
    hinglish: "Exploring Vivek साथी as Guest Seeker"
  };
  showToast(msgs[lang] || msgs.hinglish);
}

function switchAuthTab(mode) {
  document.querySelectorAll('.auth-tab-link').forEach(btn => btn.classList.remove('active'));
  document.getElementById('authPanelMobile').style.display = 'none';
  document.getElementById('authPanelPassword').style.display = 'none';
  document.getElementById('authPanelOtp').style.display = 'none';
  document.getElementById('authPanelRegister').style.display = 'none';

  if (mode === 'mobile') {
    document.getElementById('authTabBtnMobile')?.classList.add('active');
    document.getElementById('authPanelMobile').style.display = 'block';
  } else if (mode === 'password') {
    document.getElementById('authTabBtnPassword')?.classList.add('active');
    document.getElementById('authPanelPassword').style.display = 'block';
  } else if (mode === 'otp') {
    document.getElementById('authTabBtnOtp')?.classList.add('active');
    document.getElementById('authPanelOtp').style.display = 'block';
  } else if (mode === 'register') {
    document.getElementById('authTabBtnRegister')?.classList.add('active');
    document.getElementById('authPanelRegister').style.display = 'block';
  }
}

// 1. Mobile Number OTP Handlers
let currentMobilePending = '';
async function requestMobileOtpFromBackend() {
  const mobileInput = document.getElementById('authMobileTargetInput');
  const mobile = (mobileInput?.value || '').trim().replace(/[^0-9]/g, '');
  const btn = document.getElementById('sendMobileOtpBtn');
  const lang = AppState.currentLang || 'hinglish';

  if (!mobile || mobile.length < 10) {
    const errMsgs = {
      english: '⚠️ Please enter a valid 10-digit mobile number!',
      hindi: '⚠️ कृपया 10-अंकों का वैध मोबाइल नंबर दर्ज करें!',
      hinglish: '⚠️ Kripya 10-digit mobile number enter karein!'
    };
    showToast(errMsgs[lang] || errMsgs.hinglish, 'error');
    mobileInput?.focus();
    return;
  }

  btn.innerText = 'Sending...';
  btn.disabled = true;

  try {
    const res = await fetch('/api/auth/send-mobile-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: mobile })
    });
    const data = await res.json();

    btn.innerText = 'Sent ✓';
    btn.disabled = false;

    if (data.status === 'success') {
      currentMobilePending = mobile;
      document.getElementById('mobileOtpCodeInputGroup').style.display = 'block';
      document.getElementById('verifyMobileOtpBtn').style.display = 'block';

      showToast(data.message || `OTP dispatched to +91-${mobile}!`);

      // Auto-fill preview for seamless testing
      if (data.otp_preview) {
        const otpInput = document.getElementById('authMobileOtpCodeInput');
        if (otpInput) {
          otpInput.value = data.otp_preview;
          otpInput.focus();
        }
      }
    } else {
      showToast(data.message || 'Failed to send Mobile OTP', 'error');
    }
  } catch (err) {
    btn.innerText = 'Send OTP';
    btn.disabled = false;
    showToast('Network error while requesting Mobile OTP', 'error');
  }
}

async function verifyMobileOtpAndLogin() {
  const otpCode = (document.getElementById('authMobileOtpCodeInput')?.value || '').trim();
  const mobile = currentMobilePending || (document.getElementById('authMobileTargetInput')?.value || '').trim().replace(/[^0-9]/g, '');

  if (!otpCode || otpCode.length !== 6) {
    showToast('⚠️ 6-digit OTP code enter karein!', 'error');
    return;
  }

  try {
    const res = await fetch('/api/auth/verify-mobile-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: mobile, otp_code: otpCode })
    });
    const data = await res.json();

    if (data.status === 'success') {
      setUserSession(data.user);
      closeAuthModal();
      showToast(`🎉 Welcome ${data.user.name}! Unique Handle: @${data.user.username}`);
      triggerConfetti();
    } else {
      showToast(data.message || 'Invalid or expired OTP', 'error');
    }
  } catch (err) {
    showToast('Verification failed', 'error');
  }
}

// 2. Email OTP Handlers (via Gmail SMTP dispatcher)
async function requestOtpFromBackend() {
  const email = (document.getElementById('authOtpTargetInput')?.value || '').trim().toLowerCase();
  const btn = document.getElementById('sendOtpBtn');

  if (!email || !email.includes('@')) {
    showToast('⚠️ Kripya valid Email Address enter karein!', 'error');
    return;
  }

  btn.innerText = 'Sending...';
  btn.disabled = true;

  try {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email })
    });
    const data = await res.json();

    btn.innerText = 'Sent ✓';
    btn.disabled = false;

    if (data.status === 'success') {
      AppState.otpPendingEmail = email;
      document.getElementById('otpCodeInputGroup').style.display = 'block';
      document.getElementById('verifyOtpBtn').style.display = 'block';

      showToast(data.message || `OTP dispatched to ${email}!`);
      
      if (data.otp_preview) {
        const otpInput = document.getElementById('authOtpCodeInput');
        if (otpInput) otpInput.value = data.otp_preview;
      }
    } else {
      showToast(data.message || 'Failed to send OTP', 'error');
    }
  } catch (err) {
    btn.innerText = 'Send OTP';
    btn.disabled = false;
    showToast('Network error while requesting OTP', 'error');
  }
}

async function verifyOtpAndLogin() {
  const otpCode = (document.getElementById('authOtpCodeInput')?.value || '').trim();
  const email = AppState.otpPendingEmail || (document.getElementById('authOtpTargetInput')?.value || '').trim().toLowerCase();

  if (!otpCode || otpCode.length !== 6) {
    showToast('⚠️ 6-digit OTP code enter karein!', 'error');
    return;
  }

  try {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, otp_code: otpCode })
    });
    const data = await res.json();

    if (data.status === 'success') {
      setUserSession(data.user);
      closeAuthModal();
      showToast(`🎉 Pranaam ${data.user.name}! Unique Handle: @${data.user.username}`);
      triggerConfetti();
    } else {
      showToast(data.message || 'Invalid or expired OTP', 'error');
    }
  } catch (err) {
    showToast('Verification failed', 'error');
  }
}

// 3. Password Login
async function submitPasswordLogin() {
  const identifier = (document.getElementById('loginIdentifierInput')?.value || '').trim().toLowerCase();
  const password = (document.getElementById('loginPasswordInput')?.value || '').trim();

  if (!identifier || !password) {
    showToast('⚠️ Email/Mobile/Username and Password required!', 'error');
    return;
  }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();

    if (data.status === 'success') {
      setUserSession(data.user);
      closeAuthModal();
      showToast(`🎉 Welcome back, ${data.user.name} (@${data.user.username})!`);
    } else {
      showToast(data.message || 'Login failed', 'error');
    }
  } catch (err) {
    showToast('Error during login', 'error');
  }
}

// 4. Registration with Mobile, Email & Unique Username
async function submitRegistration() {
  const name = (document.getElementById('regNameInput')?.value || '').trim();
  const username = (document.getElementById('regUsernameInput')?.value || '').trim().toLowerCase();
  const email = (document.getElementById('regEmailInput')?.value || '').trim().toLowerCase();
  const mobile = (document.getElementById('regMobileInput')?.value || '').trim().replace(/[^0-9]/g, '');
  const password = (document.getElementById('regPasswordInput')?.value || '').trim();

  if (!name || !email || !password) {
    showToast('⚠️ Full Name, Email, and Password are required!', 'error');
    return;
  }

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, email, mobile, password })
    });
    const data = await res.json();

    if (data.status === 'success') {
      setUserSession(data.user);
      closeAuthModal();
      showToast(`🎉 Registered successfully! Your handle is @${data.user.username}.`);
      triggerConfetti();
    } else {
      showToast(data.message || 'Registration failed', 'error');
    }
  } catch (err) {
    showToast('Error during registration', 'error');
  }
}

// Dynamic Google Sign-In for ANY user account
function openGoogleAccountPrompt() {
  closeAuthModal();
  document.getElementById('googlePromptModalOverlay')?.classList.add('open');
}

function closeGoogleAccountPrompt() {
  document.getElementById('googlePromptModalOverlay')?.classList.remove('open');
}

function quickSelectGoogle(name, email) {
  document.getElementById('googleUserNameInput').value = name;
  document.getElementById('googleUserEmailInput').value = email;
}

async function submitDynamicGoogleAuth() {
  const name = (document.getElementById('googleUserNameInput')?.value || '').trim() || 'Google Seeker';
  const email = (document.getElementById('googleUserEmailInput')?.value || '').trim().toLowerCase();

  if (!email || !email.includes('@')) {
    showToast('⚠️ Valid Google email address enter karein!', 'error');
    return;
  }

  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });
    const data = await res.json();

    if (data.status === 'success') {
      setUserSession(data.user);
      closeGoogleAccountPrompt();
      showToast(`🎉 Signed in as ${data.user.name} (@${data.user.username})!`);
      triggerConfetti();
    } else {
      showToast(data.message || 'Google Auth failed', 'error');
    }
  } catch (err) {
    showToast('Error connecting with Google', 'error');
  }
}

function setUserSession(user) {
  AppState.currentUser = user;
  localStorage.setItem('vivek_user', JSON.stringify(user));
  if (user.karma_points !== undefined) {
    AppState.karmaPoints = Math.max(0, user.karma_points);
    localStorage.setItem('vivek_karma', AppState.karmaPoints.toString());
  }

  // Save to accounts list for easy switching
  try {
    let accounts = JSON.parse(localStorage.getItem('vivek_accounts') || '[]');
    const idx = accounts.findIndex(a => (user.id && a.id === user.id) || (user.username && a.username === user.username));
    if (idx >= 0) {
      accounts[idx] = user;
    } else {
      accounts.push(user);
    }
    localStorage.setItem('vivek_accounts', JSON.stringify(accounts));
  } catch (e) {}

  updateUserUI();
  updateKarmaDisplay();
  renderCommunityFeed(); // update with user's unique identity
  fetchAndRenderPastSessions(); // load previous mentorship cycle
}

// ==========================================
// COMMUNITY MODERATION, PROFANITY & DEFAULTER SHIELD
// ==========================================
const DIRTY_WORDS_PATTERNS = [
  /\b(?:m[c\*]|b[c\*]|bkl|bsdk|mc|bc)\b/i,
  /\b(?:madar\s*chod|maadar\s*chod|mader\s*chod|ma\s*chod|madarjaat|madarchod[a-z]*)\b/i,
  /\b(?:behen\s*chod|behn\s*chod|bhen\s*chod|bhenchod[a-z]*|bahan\s*chod)\b/i,
  /\b(?:bhosad[a-z]*|bhosd[a-z]*|bhosadi[a-z]*|b\.h\.o\.s\.d[a-z]*)\b/i,
  /\b(?:chuti[a-z]*|chooti[a-z]*|chutiy[a-z]*|c\.h\.u\.t\.i\.y\.a)\b/i,
  /\b(?:gand[a-z]*|gaand[a-z]*|gandu|gaandu)\b/i,
  /\b(?:harami[a-z]*|haramzada[a-z]*|haraamzada[a-z]*|haramkhor)\b/i,
  /\b(?:randi[a-z]*|raand[a-z]*|randwa|randibaaz)\b/i,
  /\b(?:l[auo]d[aei][a-z]*|lund[a-z]*|lawda[a-z]*|loda[a-z]*)\b/i,
  /\b(?:kamin[aei][a-z]*|kutta|kutte|suar)\b/i,
  /\b(?:tatte|muthal|chudai|chodna|chodo)\b/i,
  /\b(?:f+u+c+k+[a-z]*|f+\*+c+k+|f+k+i+n+g+|motherfuck[a-z]*)\b/i,
  /\b(?:s+h+i+t+[a-z]*|s+\*+i+t+|bullshit)\b/i,
  /\b(?:b+i+t+c+h+[a-z]*|b+\*+t+c+h+)\b/i,
  /\b(?:a+s+s+h+o+l+e+[a-z]*|a+\*+\*+h+o+l+e+|dumbass|jackass)\b/i,
  /\b(?:b+a+s+t+a+r+d+[a-z]*|d+i+c+k+[a-z]*|p+u+s+s+y+[a-z]*|c+u+n+t+[a-z]*|s+l+u+t+[a-z]*|w+h+o+r+e+[a-z]*)\b/i,
  /\b(?:kill\s+yourself|kys)\b/i
];

function checkDirtyCommentClient(text) {
  if (!text) return { isDirty: false };
  const lowered = text.toLowerCase();
  const cleaned = lowered.replace(/[\*\.\-_,/\\#@!$%^&()]/g, '');
  for (const pat of DIRTY_WORDS_PATTERNS) {
    if (pat.test(lowered) || pat.test(cleaned)) {
      return { isDirty: true, pattern: pat.toString() };
    }
  }
  return { isDirty: false };
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function isCurrentUserBlocked() {
  const user = AppState.currentUser;
  if (!user) return false;
  if (user.is_blocked || user.is_defaulter) return true;
  const localBlocked = localStorage.getItem(`vivek_blocked_${user.username || ''}`);
  if (localBlocked === '1') return true;
  if (AppState.blockedUsersSet && AppState.blockedUsersSet.has((user.username || '').toLowerCase())) return true;
  return false;
}

function updateUserUI() {
  const user = AppState.currentUser;
  const lang = AppState.currentLang || 'hinglish';
  const navBtn = document.getElementById('authPortalNavBtn');
  const navName = document.getElementById('navUserName');
  const navAvatar = document.getElementById('navUserAvatar');
  const sidebarUser = document.getElementById('sidebarUserNameLabel');
  const sidebarHandle = document.getElementById('sidebarUserHandleLabel');
  const postingAs = document.getElementById('postingAsLabel');
  const postingAvatar = document.getElementById('postingAsAvatar');

  const guestLabels = {
    english: { name: "Guest Seeker", sidebar: "🌟 Guest Seeker", posting: "Guest Seeker (@guest)" },
    hindi: { name: "अतिथि साधक", sidebar: "🌟 अतिथि साधक", posting: "अतिथि साधक (@guest)" },
    hinglish: { name: "Guest Seeker", sidebar: "🌟 Guest Seeker", posting: "Guest Seeker (@guest)" }
  };
  const g = guestLabels[lang] || guestLabels.hinglish;
  const t = Translations[lang] || Translations.hinglish;

  if (user) {
    const handleTag = `@${user.username || 'user'}`;
    if (navName) navName.innerText = user.name.split(' ')[0];
    if (navAvatar) navAvatar.innerText = user.avatar || '🧘‍♂️';
    if (sidebarUser) sidebarUser.innerText = `🌟 ${user.name}`;
    if (sidebarHandle) sidebarHandle.innerText = handleTag;
    if (postingAs) postingAs.innerText = `${user.name} (${handleTag})`;
    if (postingAvatar) postingAvatar.innerText = user.avatar || '🧘‍♂️';
  } else {
    if (navName) navName.innerText = t.auth_btn_login || 'Login / Register';
    if (navAvatar) navAvatar.innerText = '🧘‍♂️';
    if (sidebarUser) sidebarUser.innerText = g.sidebar;
    if (sidebarHandle) sidebarHandle.innerText = '@guest';
    if (postingAs) postingAs.innerText = g.posting;
    if (postingAvatar) postingAvatar.innerText = '🧘‍♂️';
  }

  // Defaulter & Blocked Community Status Enforcement
  const isBlocked = isCurrentUserBlocked();
  const blockedBanner = document.getElementById('communityBlockedBanner');
  const postTextarea = document.getElementById('newCommunityPostText');
  const postBtn = document.querySelector('.post-publish-btn');
  const postAnonCheck = document.getElementById('postAnonymousCheck');
  const blockedReasonTxt = document.getElementById('communityBlockedReasonText');

  if (isBlocked) {
    if (blockedBanner) blockedBanner.style.display = 'block';
    if (blockedReasonTxt && user && user.block_reason) {
      blockedReasonTxt.innerHTML = `Your account (@${user.username}) has been restricted from posting or commenting in Youth Sangam. <strong>Reason:</strong> ${escapeHtml(user.block_reason)}. Swami Vivekananda teaches: <em>"Purity of thought, speech, and action is the eternal foundation of strength."</em> Defaulter behavior and dirty comments are strictly barred.`;
    }
    if (postTextarea) {
      postTextarea.disabled = true;
      postTextarea.placeholder = '🔒 Community access suspended: You cannot publish dilemmas while flagged as a Defaulter.';
      postTextarea.style.opacity = '0.6';
      postTextarea.style.cursor = 'not-allowed';
    }
    if (postBtn) {
      postBtn.disabled = true;
      postBtn.style.opacity = '0.5';
      postBtn.style.cursor = 'not-allowed';
      postBtn.innerHTML = `<span>🔒</span> <span>Posting Blocked (Defaulter)</span>`;
    }
    if (postAnonCheck) postAnonCheck.disabled = true;
  } else {
    if (blockedBanner) blockedBanner.style.display = 'none';
    if (postTextarea) {
      postTextarea.disabled = false;
      postTextarea.placeholder = "Share your dilemma or question... (e.g. 'How to overcome anxiety and build consistency?')";
      postTextarea.style.opacity = '1';
      postTextarea.style.cursor = 'text';
    }
    if (postBtn) {
      postBtn.disabled = false;
      postBtn.style.opacity = '1';
      postBtn.style.cursor = 'pointer';
      postBtn.innerHTML = `<span>🚀</span> <span data-i18n="btn_publish_post">Post in Sangam (+5 Karma)</span>`;
    }
    if (postAnonCheck) postAnonCheck.disabled = false;
  }
}

// User Portal Modal
function openUserPortalModal() {
  const user = AppState.currentUser;
  if (!user) {
    openAuthModal();
    return;
  }

  document.getElementById('portalUserName').innerText = user.name;
  document.getElementById('portalUserHandle').innerText = `@${user.username || 'seeker'}`;
  document.getElementById('portalUserEmail').innerText = user.email || 'Email verified';
  document.getElementById('portalUserAvatar').innerText = user.avatar || '🧘‍♂️';
  document.getElementById('portalStatsKarma').innerText = AppState.karmaPoints;
  const sessionCount = user.session_count !== undefined 
    ? user.session_count 
    : (AppState.pastMentorshipSessions ? AppState.pastMentorshipSessions.length : 0);
  const portalMentorships = document.getElementById('portalStatsMentorships');
  if (portalMentorships) portalMentorships.innerText = sessionCount.toString();

  document.getElementById('editProfileNameInput').value = user.name || '';
  document.getElementById('editProfileHandleInput').value = user.username || '';
  document.getElementById('editProfileBioInput').value = user.bio || '';
  if (user.spiritual_goal) {
    document.getElementById('editProfileGoalInput').value = user.spiritual_goal;
  }

  document.getElementById('userPortalModalOverlay')?.classList.add('open');
}

function closeUserPortalModal() {
  document.getElementById('userPortalModalOverlay')?.classList.remove('open');
}

function selectAvatarIcon(icon) {
  document.getElementById('portalUserAvatar').innerText = icon;
  if (AppState.currentUser) {
    AppState.currentUser.avatar = icon;
  }
  showToast(`Avatar updated: ${icon}`);
}

async function saveUserProfileChanges() {
  const user = AppState.currentUser;
  if (!user) return;

  const newName = (document.getElementById('editProfileNameInput')?.value || '').trim();
  const newHandle = (document.getElementById('editProfileHandleInput')?.value || '').trim().toLowerCase();
  const newGoal = document.getElementById('editProfileGoalInput')?.value || '';
  const newBio = (document.getElementById('editProfileBioInput')?.value || '').trim();
  const newAvatar = document.getElementById('portalUserAvatar')?.innerText || '🧘‍♂️';

  if (!newName) {
    showToast('⚠️ Name cannot be empty!', 'error');
    return;
  }

  try {
    const res = await fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        name: newName,
        username: newHandle,
        spiritual_goal: newGoal,
        bio: newBio,
        avatar: newAvatar
      })
    });
    const data = await res.json();

    if (data.status === 'success') {
      setUserSession(data.user);
      closeUserPortalModal();
      showToast('💾 Profile & unique handle saved!');
    } else {
      showToast(data.message || 'Update failed', 'error');
    }
  } catch (err) {
    user.name = newName;
    user.username = newHandle;
    user.spiritual_goal = newGoal;
    user.bio = newBio;
    user.avatar = newAvatar;
    setUserSession(user);
    closeUserPortalModal();
    showToast('💾 Profile saved locally!');
  }
}

function logoutUser() {
  AppState.currentUser = null;
  localStorage.removeItem('vivek_user');
  updateUserUI();
  closeUserPortalModal();
  showToast('Logged out of Vivek साथी');
}

// ==========================================
// 4. AI MENTORSHIP & NLP MODEL INTEGRATION
// ==========================================
function handleCharCount() {
  const input = document.getElementById('userSituationInput');
  const counter = document.getElementById('charCountLabel');
  if (input && counter) {
    counter.innerText = `${input.value.length} / 600`;
  }
}

function applyPresetPrompt(topic) {
  const input = document.getElementById('userSituationInput');
  if (!input) return;

  const lang = AppState.currentLang || 'hinglish';
  const langPresets = PresetPrompts[lang] || PresetPrompts.hinglish;

  input.value = langPresets[topic] || '';
  handleCharCount();
  input.focus();
}

async function processSituationMentorship() {
  const input = document.getElementById('userSituationInput');
  const text = (input?.value || '').trim();
  const lang = AppState.currentLang || 'hinglish';

  if (!text) {
    const errorMsgs = {
      english: '⚠️ Please describe your situation or dilemma!',
      hindi: '⚠️ कृपया अपनी स्थिति अथवा दुविधा यहाँ लिखें!',
      hinglish: '⚠️ Kripya apni sthiti ya sawal likhein!'
    };
    showToast(errorMsgs[lang] || errorMsgs.hinglish, 'error');
    input?.focus();
    return;
  }

  // Transitions
  document.getElementById('emptyGuidanceState').style.display = 'none';
  document.getElementById('activeGuidanceResult').style.display = 'none';
  const processingCard = document.getElementById('processingGuidanceState');
  processingCard.style.display = 'flex';

  const user = AppState.currentUser;
  try {
    const res = await fetch('/api/mentor/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem: text, lang: lang, user_id: user ? user.id : null })
    });
    const data = await res.json();

    if (data.karma_points !== undefined) {
      AppState.karmaPoints = Math.max(0, data.karma_points);
      localStorage.setItem('vivek_karma', AppState.karmaPoints.toString());
      if (user) {
        user.karma_points = AppState.karmaPoints;
        localStorage.setItem('vivek_user', JSON.stringify(user));
      }
      updateKarmaDisplay();
    }

    setTimeout(() => {
      processingCard.style.display = 'none';
      displayGuidanceResult(data);
      fetchAndRenderPastSessions();
    }, 1200);

  } catch (err) {
    const fallbackByLang = {
      english: {
        slogan: "उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत।",
        slogan_translation: "Arise, awake, and stop not till the goal is reached!",
        story: {
          title: "The Monkeys of Varanasi (Face the Brutes!)",
          text: "When aggressive monkeys chased young Narendra, an old monk shouted: 'Face the brutes!' He stopped, turned like a lion, and the monkeys fled. Never run away from difficulties!",
          lesson: "Face your difficulties boldly; they will flee before your courage."
        },
        voice_narration: "Arise, awake! Face the brutes! Whenever fear confronts you, stand firm like a lion, and all fears will vanish."
      },
      hindi: {
        slogan: "उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत।",
        slogan_translation: "उठो, जागो और तब तक मत रुको जब तक लक्ष्य प्राप्त न हो जाए!",
        story: {
          title: "काशी के वानर (डटकर सामना करो!)",
          text: "जब वानर नरेंद्र के पीछे पड़े, एक संन्यासी ने कहा: 'रुको! डटकर सामना करो!' नरेंद्र सिंह के समान निर्भीक होकर पलट गए और वानर भाग खड़े हुए। कभी संकट से मत भागो!",
          lesson: "कठिनाइयों का साहस से सामना करें, वे आपके पराक्रम के आगे स्वतः भाग जाएंगी।"
        },
        voice_narration: "उत्तिष्ठत जाग्रत! संकट का डटकर सामना करो। भय के आगे सिर मत झुकाओ, सिंह के समान आगे बढ़ो।"
      },
      hinglish: {
        slogan: "उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत।",
        slogan_translation: "Arise, awake, aur tab tak mat ruko jab tak lakshya na mil jaye!",
        story: {
          title: "The Monkeys of Varanasi (Face the Brutes!)",
          text: "Jab bandaron ne Narendra ka peecha kiya, ek monk ne kaha: 'Face the brutes!' Wo sher ki tarah ruk kar khade ho gaye aur bandar bhaag gaye. Kabhi darr se mat bhaago!",
          lesson: "Mushkilon ka seena taan kar samna karein; wo aapke sahas ke aage haar maan lengi."
        },
        voice_narration: "Utho, jaago mere saathi! Face the brutes! Darr se mat bhaago, sher ki tarah khade ho jao."
      }
    };

    setTimeout(() => {
      processingCard.style.display = 'none';
      displayGuidanceResult(fallbackByLang[lang] || fallbackByLang.hinglish);
    }, 1200);
  }
}

function displayGuidanceResult(data) {
  AppState.currentGuidance = data;
  const resultCard = document.getElementById('activeGuidanceResult');
  const lang = AppState.currentLang || 'hinglish';
  const dict = Translations[lang] || Translations.hinglish;

  // Populate Story & Slogan
  document.getElementById('resultStoryTitle').innerText = data.story.title;
  document.getElementById('resultStoryBody').innerText = data.story.text;
  document.getElementById('resultStoryLesson').innerHTML = `💡 <strong>${dict.lesson_prefix || 'Life Lesson:'}</strong> ${data.story.lesson}`;
  document.getElementById('resultSanskritQuote').innerText = data.slogan;
  document.getElementById('resultTranslationQuote').innerText = `"${data.slogan_translation}"`;
  document.getElementById('activeSubtitleText').innerText = `"${data.slogan_translation}"`;

  resultCard.style.display = 'block';

  // Render Action Engine & Cognitive Reframing
  renderActionPlanAndGuidance(data);
  renderNext24Checklist(data.next_24_hours || []);
  renderHiggsfieldInspector(data);
  loadActiveSadhanaChallenge();

  // Match and load multi-language HD Video Katha matching seeker's dilemma
  const matchedTheme = matchVideoThemeFromGuidance(data);
  loadVivekVaniVideo(matchedTheme, AppState.currentLang, false);

  // If in canvas mode, start canvas animation
  if (AppState.videoPlayerMode === 'canvas') {
    startVideoAnimation(data);
  }

  // Award user 10 Karma points for reflection!
  const karmaReason = lang === 'hindi' ? 'दैनिक मार्गदर्शन एवं प्रसंग चिंतन' : (lang === 'english' ? 'Daily Mentorship & Story Reflection' : 'Daily Mentorship & Story Reflection');
  addKarma(10, karmaReason);

  // Auto-record session into local history so it is instantly available in Past Sessions
  try {
    const user = AppState.currentUser;
    const guestSessions = JSON.parse(localStorage.getItem('vivek_guest_sessions') || '[]');
    const newSession = {
      id: data.session_id || `msess_${Date.now()}`,
      user_id: user?.id || null,
      problem_text: (document.getElementById('userSituationInput')?.value || data.story?.title || 'Life Dilemma').trim(),
      story_id: data.story_id || 'story_monkeys_varanasi',
      story_title: data.story?.title || '',
      story_text: data.story?.text || '',
      story_lesson: data.story?.lesson || '',
      sanskrit_slogan: data.slogan || '',
      slogan_translation: data.slogan_translation || '',
      voice_narration: data.voice_narration || '',
      video_theme: data.video_theme || 'golden_radiance',
      created_at: new Date().toISOString()
    };
    const existingIdx = guestSessions.findIndex(s => s.id === newSession.id);
    if (existingIdx >= 0) guestSessions[existingIdx] = newSession;
    else guestSessions.unshift(newSession);
    localStorage.setItem('vivek_guest_sessions', JSON.stringify(guestSessions.slice(0, 30)));
    fetchAndRenderPastSessions();
  } catch (e) {}
}

// ==========================================
// 5. SWAMI VIVEKANANDA BARITONE VOICE SYNTHESIS & SYNC ENGINE
// ==========================================
function toggleSwamiVoicePlayback() {
  toggleVideoPlayback();
}

function toggleVideoVoiceNarration() {
  AppState.isSwamiVoiceMuted = !AppState.isSwamiVoiceMuted;
  const btn = document.getElementById('videoVoiceToggleBtn');
  const pillText = document.getElementById('videoVoiceStatusText');
  const pulseDot = document.querySelector('.voice-pulse-dot');

  if (AppState.isSwamiVoiceMuted) {
    if (btn) {
      btn.innerHTML = '🔇 Voice OFF';
      btn.classList.remove('active-toggle');
    }
    if (pillText) pillText.innerText = 'Swami ji Voice: Muted';
    if (pulseDot) pulseDot.style.background = '#64748b';
    clearTimeout(AppState.scenePauseTimer);
    if (AppState.activeSpeechUtterance) {
      AppState.activeSpeechUtterance.onend = null;
      AppState.activeSpeechUtterance.onerror = null;
      AppState.activeSpeechUtterance = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    showToast('🔇 Swami ji voice narration muted');
    if (AppState.isVideoPlaying) {
      scheduleMutedSceneAdvance(AppState.currentScene || 1, AppState.currentGuidance);
    }
  } else {
    if (btn) {
      btn.innerHTML = '🔊 Voice ON';
      btn.classList.add('active-toggle');
    }
    if (pillText) pillText.innerText = 'Swami ji Voice: Active';
    if (pulseDot) pulseDot.style.background = '#10b981';
    clearTimeout(AppState.scenePauseTimer);
    showToast('🔊 Swami ji voice narration enabled');
    if (AppState.isVideoPlaying) {
      speakSceneNarrationForVideo(AppState.currentScene || 1, AppState.currentGuidance);
    }
  }
}

function getDefaultInitialGuidance() {
  return {
    slogan: "उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत।",
    slogan_translation: "Arise, awake, and stop not till the goal is reached!",
    story_id: "story_monkeys_varanasi",
    story: {
      title: "The Monkeys of Varanasi (Face the Brutes!)",
      text: "When aggressive monkeys chased young Narendra in Varanasi, an old monk shouted: 'Face the brutes!' He stopped, turned like a lion, and the monkeys fled. Never run away from difficulties!",
      lesson: "Face your difficulties boldly; they will flee before your courage."
    },
    video_subtitles: [
      "Face your deepest fears with lion-hearted courage.",
      "Never run away from difficulties — stand your ground!",
      "You are the eternal soul, full of infinite strength.",
      "Arise, awake, and stop not till the goal is reached!"
    ],
    all_translations: {
      hindi: {
        story_title: "काशी के वानर (डटकर सामना करो!)",
        story_text: "जब काशी में वानर नरेंद्र के पीछे पड़े, एक संन्यासी ने पुकारा: 'रुको! डटकर सामना करो!' नरेंद्र सिंह के समान निर्भीक होकर पलट गए और वानर भाग खड़े हुए। कभी संकट से मत भागो!",
        story_lesson: "कठिनाइयों का साहस से सामना करें, वे आपके पराक्रम के आगे स्वतः भाग जाएंगी।",
        slogan_trans: "उठो, जागो और तब तक मत रुको जब तक लक्ष्य प्राप्त न हो जाए!",
        slogan_translation: "उठो, जागो और तब तक मत रुको जब तक लक्ष्य प्राप्त न हो जाए!",
        video_subtitles: [
          "भय और संकट का सिंह के समान निर्भीकता से सामना करो।",
          "कठिनाइयों से कभी मत भागो — डटकर मुकाबला करो!",
          "तुम साक्षात अमृतपुत्र हो, अनंत सामर्थ्य तुम्हारे भीतर है।",
          "उठो, जागो और लक्ष्य प्राप्ति तक रुको मत!"
        ]
      },
      hinglish: {
        story_title: "The Monkeys of Varanasi (Face the Brutes!)",
        story_text: "Jab Varanasi mein bandaron ne Narendra ka peecha kiya, ek monk ne pukara: 'Face the brutes!' Wo sher ki tarah ruk kar khade ho gaye aur bandar bhaag gaye. Kabhi mushkilon se mat bhaago!",
        story_lesson: "Mushkilon ka seena taan kar samna karein; wo aapke sahas ke aage haar maan lengi.",
        slogan_trans: "Arise, awake, aur tab tak mat ruko jab tak lakshya na mil jaye!",
        slogan_translation: "Arise, awake, aur tab tak mat ruko jab tak lakshya na mil jaye!",
        video_subtitles: [
          "Mushkilon se bhaago mat — Face the brutes boldly!",
          "Sher ki tarah khade ho jao, mushkilein khud peeche hatengi.",
          "Aapke andar anant shakti hai, khud par vishwas rakho.",
          "Utho, jaago aur jab tak lakshya na mile tab tak ruko mat!"
        ]
      },
      english: {
        story_title: "The Monkeys of Varanasi (Face the Brutes!)",
        story_text: "When aggressive monkeys chased young Narendra in Varanasi, an old monk shouted: 'Face the brutes!' He stopped, turned like a lion, and the monkeys fled. Never run away from difficulties!",
        story_lesson: "Face your difficulties boldly; they will flee before your courage.",
        slogan_trans: "Arise, awake, and stop not till the goal is reached!",
        slogan_translation: "Arise, awake, and stop not till the goal is reached!",
        video_subtitles: [
          "Face your deepest fears with lion-hearted courage.",
          "Never run away from difficulties — stand your ground!",
          "You are the eternal soul, full of infinite strength.",
          "Arise, awake, and stop not till the goal is reached!"
        ]
      }
    }
  };
}

function estimateSpeechDuration(text, lang) {
  if (!text) return 7.5;
  const clean = text.replace(/[\u0964\.,!?:;—\-]/g, ' ').trim();
  const words = clean.split(/\s+/).filter(Boolean).length;
  const wps = lang === 'hindi' ? 2.1 : 2.4;
  const rawDuration = words / wps;
  return Math.max(6.0, Math.round((rawDuration + 0.6) * 10) / 10);
}

function initVideoTimeline(guidance) {
  guidance = guidance || AppState.currentGuidance || getDefaultInitialGuidance();
  const lang = (AppState.currentLang || 'hinglish').toLowerCase();

  const s1 = getSceneNarrationScript(1, guidance);
  const s2 = getSceneNarrationScript(2, guidance);
  const s3 = getSceneNarrationScript(3, guidance);
  const s4 = getSceneNarrationScript(4, guidance);

  const d1 = estimateSpeechDuration(s1, lang);
  const d2 = estimateSpeechDuration(s2, lang);
  const d3 = estimateSpeechDuration(s3, lang);
  const d4 = estimateSpeechDuration(s4, lang);

  const starts = [0, d1, Math.round((d1 + d2) * 10) / 10, Math.round((d1 + d2 + d3) * 10) / 10];
  const total = Math.round((d1 + d2 + d3 + d4) * 10) / 10;

  AppState.videoTimeline = {
    durations: [d1, d2, d3, d4],
    starts: starts,
    total: total
  };
  AppState.videoTotalDuration = total;
  return AppState.videoTimeline;
}

function getActiveSceneNumber(time) {
  if (AppState.videoTimeline && AppState.videoTimeline.starts) {
    const starts = AppState.videoTimeline.starts;
    for (let s = starts.length - 1; s >= 0; s--) {
      if (time >= starts[s] - 0.1) return s + 1;
    }
  }
  return AppState.currentScene || 1;
}

function getSceneNarrationScript(sceneNum, guidance) {
  guidance = guidance || AppState.currentGuidance || getDefaultInitialGuidance();
  const lang = (AppState.currentLang || 'hinglish').toLowerCase();
  const tObj = guidance.all_translations?.[lang] || guidance.all_translations?.['english'] || {};
  const subs = guidance.video_subtitles || tObj.video_subtitles || [];
  
  if (sceneNum === 1) {
    if (lang === 'hindi') {
      return `मेरे प्रिय साधक, जीवन के संकटों और अंधकार से कभी मत डरो! अपने भीतर की अनंत शक्ति को पहचानो। ${subs[0] || 'डटकर सामना करो!'}`;
    } else if (lang === 'hinglish') {
      return `Suno mere saathi! Mushkilon aur asafalta se bhaago mat! Face the storm boldly. ${subs[0] || 'Seena taan kar khade ho jao!'}`;
    } else {
      return `Listen, my young friend! Do not run away from failure or uncertainty. Stand firm like a lion! ${subs[0] || 'Face the storm fearlessly.'}`;
    }
  } else if (sceneNum === 2) {
    const storyTitle = guidance.story?.title || tObj.story_title || 'Swami Vivekananda Parable';
    const storyText = guidance.story?.text || tObj.story_text || '';
    const snippet = storyText.split('.')[0] + '.';
    if (lang === 'hindi') {
      return `स्वामी विवेकानंद का ऐतिहासिक प्रसंग: ${storyTitle}। ${snippet} ${subs[1] || ''}`;
    } else if (lang === 'hinglish') {
      return `Swami Vivekananda ki authentic story: ${storyTitle}। ${snippet} ${subs[1] || ''}`;
    } else {
      return `Authentic parable from Swami Vivekananda's life: ${storyTitle}. ${snippet} ${subs[1] || ''}`;
    }
  } else if (sceneNum === 3) {
    if (lang === 'hindi') {
      return `उठो! अपने भीतर की सुप्त दिव्यता को जगाओ! तुम साक्षात सिंह हो, कायर भेड़ नहीं। ${subs[2] || 'अनंत सामर्थ्य तुम्हारे भीतर है!'}`;
    } else if (lang === 'hinglish') {
      return `Utho aur roar karo! Aap kisi ke mohtaaj nahi hain, aap sher hain. ${subs[2] || 'Anant shakti aapke andar hai!'}`;
    } else {
      return `Arise! Awaken the sleeping divinity within! You are the lion of divine majesty. ${subs[2] || 'All power is within you!'}`;
    }
  } else {
    const slogan = guidance.slogan || "उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत।";
    const sloganTrans = guidance.slogan_translation || tObj.slogan_trans || tObj.slogan_translation || "Arise, awake, and stop not till the goal is reached!";
    const lesson = guidance.story?.lesson || tObj.story_lesson || "";
    if (lang === 'hindi') {
      return `स्वामी विवेकानंद का अमर महावाक्य: ${slogan} उठो, जागो और लक्ष्य प्राप्ति तक रुको मत। याद रखो: ${lesson}`;
    } else if (lang === 'hinglish') {
      return `Swami Vivekananda ka amar sandesh: ${slogan} ${sloganTrans}। Hamesha yaad rakhein: ${lesson}`;
    } else {
      return `Swami Vivekananda's immortal message: ${slogan} ${sloganTrans}. Remember: ${lesson}`;
    }
  }
}

// ==========================================
// ACCENT-AWARE VOICE SELECTOR & ENGINE
// ==========================================
function getAccentVoiceForLanguage(lang) {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  if (voices.length === 0) return null;

  lang = (lang || 'hinglish').toLowerCase();

  if (lang === 'hindi') {
    // 1. Authentic Hindi Accent (hi-IN) - Prioritize Natural/Neural voices
    return voices.find(v => (v.lang === 'hi-IN' || v.lang.startsWith('hi')) && v.name.includes('Natural'))
      || voices.find(v => (v.lang === 'hi-IN' || v.lang.startsWith('hi')) && (v.name.includes('Madhav') || v.name.includes('Hemant') || v.name.includes('Google हिन्दी') || v.name.includes('Ravi') || v.name.toLowerCase().includes('male')))
      || voices.find(v => v.lang === 'hi-IN' || v.lang.startsWith('hi'))
      || voices.find(v => v.name.toLowerCase().includes('hindi'))
      || voices.find(v => (v.lang === 'en-IN' || v.lang.includes('IN')) && v.name.toLowerCase().includes('male'))
      || voices.find(v => v.lang === 'en-IN' || v.lang.includes('IN'))
      || voices[0];

  } else if (lang === 'hinglish') {
    // 2. Authentic Hinglish Accent: Indian English (en-IN) bilingual voice with native Indian cadence
    return voices.find(v => (v.lang === 'en-IN' || v.lang === 'en_IN') && v.name.includes('Natural'))
      || voices.find(v => (v.lang === 'en-IN' || v.lang === 'en_IN') && (v.name.toLowerCase().includes('prabhat') || v.name.toLowerCase().includes('neerja') || v.name.toLowerCase().includes('ravi') || v.name.toLowerCase().includes('rishi') || v.name.toLowerCase().includes('male')))
      || voices.find(v => v.lang === 'en-IN' || v.lang === 'en_IN')
      || voices.find(v => v.name.toLowerCase().includes('india') && v.name.toLowerCase().includes('male'))
      || voices.find(v => v.name.toLowerCase().includes('india'))
      || voices.find(v => (v.lang === 'hi-IN' || v.lang.startsWith('hi')) && v.name.toLowerCase().includes('male'))
      || voices.find(v => v.lang === 'hi-IN' || v.lang.startsWith('hi'))
      || voices.find(v => (v.lang === 'en-GB' || v.lang === 'en-US') && v.name.toLowerCase().includes('male'))
      || voices[0];

  } else {
    // 3. Authentic English Accent: Oratorical baritone delivery
    return voices.find(v => (v.lang === 'en-IN' || v.lang === 'en_IN') && v.name.includes('Natural'))
      || voices.find(v => (v.lang === 'en-GB' || v.lang === 'en-US') && v.name.includes('Natural') && (v.name.includes('George') || v.name.includes('Ryan') || v.name.includes('Guy') || v.name.includes('David') || v.name.toLowerCase().includes('male')))
      || voices.find(v => (v.lang === 'en-IN' || v.lang === 'en_IN') && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('ravi') || v.name.toLowerCase().includes('rishi')))
      || voices.find(v => (v.lang === 'en-GB' || v.lang === 'en-US') && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('george') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('natural')))
      || voices.find(v => v.lang === 'en-IN' || v.lang === 'en_IN')
      || voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male'))
      || voices.find(v => v.lang.startsWith('en'))
      || voices[0];
  }
}

function getAcousticsForLanguage(lang) {
  lang = (lang || 'hinglish').toLowerCase();
  if (lang === 'hindi') {
    // Natural resonant baritone without robotic distortion
    return { pitch: 0.94, rate: 0.92, langTag: 'hi-IN', badge: 'Hindi Accent' };
  } else if (lang === 'hinglish') {
    // Warm conversational Indian cadence for natural flow
    return { pitch: 0.95, rate: 0.95, langTag: 'en-IN', badge: 'Hinglish Accent' };
  } else {
    // Resonant oratorical baritone
    return { pitch: 0.93, rate: 0.94, langTag: 'en-IN', badge: 'English Accent' };
  }
}

function speakSceneNarrationForVideo(sceneNum, guidance, explicitTime) {
  if (!('speechSynthesis' in window)) return;
  sceneNum = Math.max(1, Math.min(4, Number(sceneNum)));
  guidance = guidance || AppState.currentGuidance || getDefaultInitialGuidance();
  if (!AppState.videoTimeline) initVideoTimeline(guidance);

  AppState.currentScene = sceneNum;
  AppState.lastSpokenScene = sceneNum;

  if (typeof explicitTime === 'number') {
    AppState.videoCurrentTime = Math.max(0, Math.min(AppState.videoTotalDuration, explicitTime));
  } else if (typeof AppState.videoCurrentTime !== 'number' || AppState.videoCurrentTime === 0) {
    AppState.videoCurrentTime = AppState.videoTimeline.starts[sceneNum - 1];
  } else {
    const targetStart = AppState.videoTimeline.starts[sceneNum - 1];
    if (AppState.videoCurrentTime < targetStart) {
      AppState.videoCurrentTime = targetStart;
    }
  }

  clearTimeout(AppState.scenePauseTimer);

  // CRITICAL: Detach callbacks from previous utterance so cancellation NEVER triggers phantom skips!
  if (AppState.activeSpeechUtterance) {
    AppState.activeSpeechUtterance.onend = null;
    AppState.activeSpeechUtterance.onerror = null;
    AppState.activeSpeechUtterance = null;
  }
  window.speechSynthesis.cancel();
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
  stopAmbientSound(); // Clean silence in background (no annoying hum)

  if (AppState.isSwamiVoiceMuted) {
    scheduleMutedSceneAdvance(sceneNum, guidance);
    return;
  }

  const scriptText = getSceneNarrationScript(sceneNum, guidance);
  if (!scriptText) return;

  const utterance = new SpeechSynthesisUtterance(scriptText);
  const lang = (AppState.currentLang || 'hinglish').toLowerCase();
  const selectedVoice = getAccentVoiceForLanguage(lang);
  const acoustics = getAcousticsForLanguage(lang);

  if (selectedVoice) {
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang || acoustics.langTag;
  } else {
    utterance.lang = acoustics.langTag;
  }

  utterance.pitch = acoustics.pitch;
  utterance.rate = acoustics.rate;
  utterance.volume = 1.0;

  AppState.activeSpeechUtterance = utterance;
  AppState.isAudioPlaying = true;
  AppState.isSpeechActive = true;

  const playBtn = document.getElementById('voicePlayPauseBtn');
  if (playBtn) playBtn.innerHTML = '⏸';
  const vidPlayBtn = document.getElementById('videoPlayPauseBtn');
  if (vidPlayBtn) vidPlayBtn.innerText = '⏸';

  const pillText = document.getElementById('videoVoiceStatusText');
  if (pillText) pillText.innerText = `Swami ji: ${acoustics.badge} (Scene ${sceneNum}/4)`;

  const subtitleBox = document.getElementById('activeSubtitleText');
  if (subtitleBox) {
    subtitleBox.innerText = `"${scriptText}"`;
  }

  // Highlight active scene chip immediately
  for (let s = 1; s <= 4; s++) {
    const chip = document.getElementById(`sceneChip${s}`);
    if (chip) {
      if (s === sceneNum) chip.classList.add('active');
      else chip.classList.remove('active');
    }
  }

  // Render current scene immediately
  renderVideoFrame(AppState.videoCurrentTime, guidance);
  updateVideoProgressUI();

  // ONEND HANDLER: Natural, minimal gap between scenes (600ms breath pause)
  utterance.onend = () => {
    AppState.isSpeechActive = false;
    AppState.activeSpeechUtterance = null;
    if (!AppState.isVideoPlaying && !AppState.isAudioPlaying) return;

    if (sceneNum < 4) {
      if (pillText) pillText.innerText = `Swami ji: Reflecting... (Next: Scene ${sceneNum + 1})`;
      
      AppState.scenePauseTimer = setTimeout(() => {
        if (AppState.isVideoPlaying || AppState.isAudioPlaying) {
          advanceToScene(sceneNum + 1, guidance);
        }
      }, 600); // 600ms natural breathing gap
    } else {
      if (pillText) pillText.innerText = 'Swami ji: Discourse Completed 🙏';
      AppState.scenePauseTimer = setTimeout(() => {
        stopVideoPlaybackClean();
        AppState.videoCurrentTime = AppState.videoTotalDuration;
        updateVideoProgressUI();
        showToast('Discourse completed with peace and courage 🙏');
      }, 800);
    }
  };

  // ONERROR HANDLER: Safely ignore interrupted/canceled events without cascading!
  utterance.onerror = (e) => {
    if (e.error === 'interrupted' || e.error === 'canceled') {
      return; // Normal pause/cancel action, DO NOT CASCADE!
    }
    console.warn('SpeechSynthesis event:', e);
    AppState.isSpeechActive = false;
    AppState.activeSpeechUtterance = null;
    if (e.error === 'not-allowed') {
      if (pillText) pillText.innerText = 'Click ▶ to enable voice narration';
      return;
    }
    if (sceneNum < 4 && (AppState.isVideoPlaying || AppState.isAudioPlaying)) {
      AppState.scenePauseTimer = setTimeout(() => {
        advanceToScene(sceneNum + 1, guidance);
      }, 1000);
    }
  };

  window.speechSynthesis.speak(utterance);
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}

function advanceToScene(nextSceneNum, guidance) {
  guidance = guidance || AppState.currentGuidance || getDefaultInitialGuidance();
  if (!AppState.videoTimeline) initVideoTimeline(guidance);

  AppState.currentScene = nextSceneNum;
  const targetStart = AppState.videoTimeline.starts[nextSceneNum - 1];

  if (AppState.videoCurrentTime < targetStart) {
    AppState.videoCurrentTime = targetStart;
  } else {
    AppState.videoTimeline.starts[nextSceneNum - 1] = AppState.videoCurrentTime;
  }

  renderVideoFrame(AppState.videoCurrentTime, guidance);
  updateVideoProgressUI();
  speakSceneNarrationForVideo(nextSceneNum, guidance);
}

function scheduleMutedSceneAdvance(sceneNum, guidance) {
  clearTimeout(AppState.scenePauseTimer);
  guidance = guidance || AppState.currentGuidance || getDefaultInitialGuidance();
  if (!AppState.videoTimeline) initVideoTimeline(guidance);
  const durSec = AppState.videoTimeline.durations[sceneNum - 1] || 7.5;
  AppState.scenePauseTimer = setTimeout(() => {
    if (!AppState.isVideoPlaying) return;
    if (sceneNum < 4) {
      advanceToScene(sceneNum + 1, guidance);
    } else {
      stopVideoPlaybackClean();
      AppState.videoCurrentTime = AppState.videoTotalDuration;
      updateVideoProgressUI();
    }
  }, durSec * 1000);
}

function startSwamiVoicePlayback() {
  if (!AppState.isVideoPlaying) {
    toggleVideoPlayback();
  }
}

function stopSwamiVoicePlayback() {
  if (AppState.isVideoPlaying || AppState.isAudioPlaying) {
    toggleVideoPlayback();
  }
}

function stopVideoPlaybackClean() {
  AppState.isVideoPlaying = false;
  AppState.isAudioPlaying = false;
  cancelAnimationFrame(AppState.videoAnimFrameId);
  clearTimeout(AppState.scenePauseTimer);
  if (AppState.activeSpeechUtterance) {
    AppState.activeSpeechUtterance.onend = null;
    AppState.activeSpeechUtterance.onerror = null;
    AppState.activeSpeechUtterance = null;
  }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  stopAmbientSound();

  const playBtn = document.getElementById('videoPlayPauseBtn');
  if (playBtn) playBtn.innerText = '▶';
  const audioBtn = document.getElementById('voicePlayPauseBtn');
  if (audioBtn) audioBtn.innerHTML = '▶';
  const pillText = document.getElementById('videoVoiceStatusText');
  if (pillText) pillText.innerText = 'Swami ji Voice: Active';
}

function updateAudioTimerUI() {
  const current = AppState.videoCurrentTime;
  const total = AppState.videoTotalDuration || 36;
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m < 10 ? '0' : ''}${m}:${sec < 10 ? '0' : ''}${sec}`;
  };
  const timerLabel = document.getElementById('audioTimerDisplay');
  if (timerLabel) {
    timerLabel.innerText = `${formatTime(current)} / ${formatTime(total)}`;
  }
}

function playHarmonicChime() {
  // Silent no-op: background annoying sound removed completely!
}

function initAudioVisualizer() {
  const canvas = document.getElementById('audioVisualizerCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = 300;
  canvas.height = 40;

  let phase = 0;
  function renderVisualizer() {
    requestAnimationFrame(renderVisualizer);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const bars = 32;
    const barWidth = canvas.width / bars;

    for (let i = 0; i < bars; i++) {
      const height = AppState.isAudioPlaying || AppState.isVideoPlaying
        ? Math.sin(phase + i * 0.35) * 14 + 16 + Math.random() * 6
        : 4 + Math.sin(phase + i * 0.2) * 2;

      const x = i * barWidth;
      const y = (canvas.height - height) / 2;

      const grad = ctx.createLinearGradient(0, y, 0, y + height);
      grad.addColorStop(0, '#f5cf62');
      grad.addColorStop(1, '#ff7300');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x + 2, y, barWidth - 4, height, [3]);
      ctx.fill();
    }
    phase += (AppState.isAudioPlaying || AppState.isVideoPlaying) ? 0.16 : 0.04;
  }
  renderVisualizer();
}

// ==========================================
// 6. DYNAMIC AI VIDEO ENGINE (1:30 MIN / 90 SECONDS MULTI-SCENE ANIMATED CANVAS)
// ==========================================
function getVideoTheme(guidance, problemText) {
  const storyId = guidance?.story_id || '';
  const text = (problemText || guidance?.story?.text || '').toLowerCase();

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);

  // 1. Fear & Phobias (Monkeys of Varanasi)
  if (storyId === 'story_monkeys_varanasi' || text.includes('fear') || text.includes('darr') || text.includes('anxiety') || text.includes('bhay') || text.includes('exam')) {
    return {
      type: 'fear_courage',
      title: 'Courage Over Fear (Face the Brutes)',
      primaryColor: '#ff5722',
      secondaryColor: '#f59e0b',
      accentColor: '#ffd700',
      bgGradient: ['#1f0a04', '#090302'],
      emblem: 'lion_fire',
      raysCount: 24,
      petalsCount: 8,
      particleSpeed: 1.8,
      particleColor: 'rgba(255, 87, 34, ',
      sceneTitle1: 'The Tempest of Fear & Uncertainty',
      sceneTitle2: 'Encounter with the Varanasi Brutes',
      sceneTitle3: 'Awakening: Stand Like a Roaring Lion',
      sceneTitle4: 'Mahavakya: Strength is Life, Weakness is Death'
    };
  }
  // 2. Focus & Concentration (Eggshells on River)
  else if (storyId === 'story_river_concentration' || text.includes('focus') || text.includes('distraction') || text.includes('study') || text.includes('ekagrata') || text.includes('phone') || text.includes('reels')) {
    return {
      type: 'focus_discipline',
      title: 'Supreme Concentration (Laser Focus)',
      primaryColor: '#00d2ff',
      secondaryColor: '#3a7bd5',
      accentColor: '#f5cf62',
      bgGradient: ['#04152d', '#020914'],
      emblem: 'target_lotus',
      raysCount: 20,
      petalsCount: 12,
      particleSpeed: 1.3,
      particleColor: 'rgba(0, 210, 255, ',
      sceneTitle1: 'The Maze of Distractions & Restless Mind',
      sceneTitle2: 'The Swift River & Unbroken Aim',
      sceneTitle3: 'Awakening: Single-Minded Laser Willpower',
      sceneTitle4: 'Mahavakya: Concentration is Supreme Mastery'
    };
  }
  // 3. Physical & Mental Vitality (Football Before Gita)
  else if (storyId === 'story_football_heaven' || text.includes('weak') || text.includes('body') || text.includes('energy') || text.includes('tired') || text.includes('kamzor') || text.includes('gym')) {
    return {
      type: 'strength_vitality',
      title: 'Vitality & Power (Nerves of Steel)',
      primaryColor: '#10b981',
      secondaryColor: '#059669',
      accentColor: '#f59e0b',
      bgGradient: ['#04261d', '#010f0b'],
      emblem: 'vitality_chakra',
      raysCount: 20,
      petalsCount: 10,
      particleSpeed: 2.0,
      particleColor: 'rgba(16, 185, 129, ',
      sceneTitle1: 'The Burden of Sloth & Physical Fatigue',
      sceneTitle2: 'Football Before Gita: The Call to Vigor',
      sceneTitle3: 'Awakening: Forging Muscles of Iron & Steel Nerves',
      sceneTitle4: 'Mahavakya: Strength is Life, Weakness is Death'
    };
  }
  // 4. Rejection & Low Self-Esteem (Lion Among Sheep)
  else if (storyId === 'story_lion_among_sheep' || text.includes('rejection') || text.includes('breakup') || text.includes('inferior') || text.includes('self-esteem') || text.includes('heartbreak') || text.includes('dhokha')) {
    return {
      type: 'rejection_self_esteem',
      title: 'Divine Royalty (You Are The Lion)',
      primaryColor: '#a855f7',
      secondaryColor: '#6366f1',
      accentColor: '#f5cf62',
      bgGradient: ['#1e0c38', '#090312'],
      emblem: 'royal_crown',
      raysCount: 28,
      petalsCount: 16,
      particleSpeed: 1.4,
      particleColor: 'rgba(168, 85, 247, ',
      sceneTitle1: 'The Agony of Rejection & False Smallness',
      sceneTitle2: 'The Parable: Lion Cub Among the Sheep',
      sceneTitle3: 'Awakening: Gazing into the Pool of the Soul',
      sceneTitle4: 'Mahavakya: Tat Tvam Asi — Thou Art The Divine'
    };
  }
  // 5. Purpose & Career (The Sculptor of Destiny)
  else if (storyId === 'story_sculptor_purpose' || text.includes('purpose') || text.includes('direction') || text.includes('destiny') || text.includes('career') || text.includes('lakshya')) {
    return {
      type: 'purpose_destiny',
      title: 'Sculptor of Destiny (One Great Ideal)',
      primaryColor: '#eab308',
      secondaryColor: '#f97316',
      accentColor: '#38bdf8',
      bgGradient: ['#131b33', '#05070e'],
      emblem: 'cosmic_compass',
      raysCount: 32,
      petalsCount: 12,
      particleSpeed: 1.5,
      particleColor: 'rgba(234, 179, 8, ',
      sceneTitle1: 'The Fog of Wandering & Aimlessness',
      sceneTitle2: 'The Cosmic Ideal: Dedicating One Noble Life',
      sceneTitle3: 'Awakening: The Chisel of Willpower Carving Fate',
      sceneTitle4: 'Mahavakya: Arise, Awake and Stop Not Till The Goal is Reached'
    };
  }
  // 6. Anger & Temper Mastery (The Monk & The Scorpion)
  else if (storyId === 'story_scorpion_monk' || text.includes('anger') || text.includes('gussa') || text.includes('temper') || text.includes('krodh') || text.includes('irritation')) {
    return {
      type: 'anger_patience',
      title: 'Emotional Mastery (The Monk and The Scorpion)',
      primaryColor: '#06b6d4',
      secondaryColor: '#3b82f6',
      accentColor: '#10b981',
      bgGradient: ['#04212e', '#010c12'],
      emblem: 'lotus_shield',
      raysCount: 24,
      petalsCount: 14,
      particleSpeed: 1.2,
      particleColor: 'rgba(6, 182, 212, ',
      sceneTitle1: 'The Poisonous Surge of Anger & Impulse',
      sceneTitle2: 'The Holy Monk & The Drowning Scorpion',
      sceneTitle3: 'Awakening: Retaining Divine Nature Under Fire',
      sceneTitle4: 'Mahavakya: Self-Mastery is Supreme Power'
    };
  }
  // 7. Poverty & Financial Anxiety (Poverty at Dakshineswar)
  else if (storyId === 'story_dakshineswar_poverty' || text.includes('money') || text.includes('poverty') || text.includes('paise') || text.includes('garibi') || text.includes('debt')) {
    return {
      type: 'money_poverty',
      title: 'Divine Providence (Dakshineswar Wisdom)',
      primaryColor: '#f59e0b',
      secondaryColor: '#b45309',
      accentColor: '#fde047',
      bgGradient: ['#231204', '#0c0501'],
      emblem: 'temple_flame',
      raysCount: 26,
      petalsCount: 12,
      particleSpeed: 1.4,
      particleColor: 'rgba(245, 158, 11, ',
      sceneTitle1: 'The Crushing Cold of Poverty & Uncertainty',
      sceneTitle2: 'Standing Before Mother Kali at Dakshineswar',
      sceneTitle3: 'Awakening: Asking Only for Wisdom & Character',
      sceneTitle4: 'Mahavakya: Dharma and Skill Conquer All Debts'
    };
  }
  // 8. Loneliness & Grief (Walking in the Rain)
  else if (storyId === 'story_father_loss_grief' || text.includes('lonely') || text.includes('akela') || text.includes('grief') || text.includes('death') || text.includes('sadness')) {
    return {
      type: 'loneliness_grief',
      title: 'The Eternal Companion (You Are Never Alone)',
      primaryColor: '#818cf8',
      secondaryColor: '#4f46e5',
      accentColor: '#38bdf8',
      bgGradient: ['#0d1430', '#03050d'],
      emblem: 'celestial_atman',
      raysCount: 22,
      petalsCount: 10,
      particleSpeed: 1.1,
      particleColor: 'rgba(129, 140, 248, ',
      sceneTitle1: 'The Solitary Dark Night of the Soul',
      sceneTitle2: 'Collapsing in the Rain: Awakening to Atman',
      sceneTitle3: 'Awakening: In Deep Solitude, God is Nearest',
      sceneTitle4: 'Mahavakya: The Immortal Soul Never Dies'
    };
  }
  // 9. Ego & Arrogance (The Cobbler and Swami ji)
  else if (storyId === 'story_cobbler_divinity' || text.includes('ego') || text.includes('ghamand') || text.includes('pride') || text.includes('superior') || text.includes('attitude')) {
    return {
      type: 'ego_humility',
      title: 'Daridra Narayana (God in Every Human Soul)',
      primaryColor: '#ea580c',
      secondaryColor: '#f97316',
      accentColor: '#fcd34d',
      bgGradient: ['#230f03', '#0c0401'],
      emblem: 'hands_unity',
      raysCount: 28,
      petalsCount: 16,
      particleSpeed: 1.5,
      particleColor: 'rgba(234, 88, 12, ',
      sceneTitle1: 'The Blind Illusion of Pride & Status',
      sceneTitle2: 'Embracing the Cobbler: Service as Worship',
      sceneTitle3: 'Awakening: Shattering the Mask of the Ego',
      sceneTitle4: 'Mahavakya: See the Divine Light in All Beings'
    };
  }
  // 10. Doubt & Skepticism (Sir, Have You Seen God?)
  else if (storyId === 'story_blind_faith_truth' || text.includes('doubt') || text.includes('god') || text.includes('faith') || text.includes('truth') || text.includes('skepticism')) {
    return {
      type: 'doubt_skepticism',
      title: 'Direct Realization (Sir, Have You Seen God?)',
      primaryColor: '#eab308',
      secondaryColor: '#ca8a04',
      accentColor: '#ffffff',
      bgGradient: ['#1e1b04', '#0a0901'],
      emblem: 'sacred_lamp',
      raysCount: 30,
      petalsCount: 12,
      particleSpeed: 1.6,
      particleColor: 'rgba(234, 179, 8, ',
      sceneTitle1: 'The Questioning Intellect & Rational Doubt',
      sceneTitle2: 'Dakshineswar Encounter: Yes, I Have Seen Him!',
      sceneTitle3: 'Awakening: Test Truth Like Gold on Touchstone',
      sceneTitle4: 'Mahavakya: Truth Alone Triumphs, Never Dogma'
    };
  }
  // 11. Addiction & Restless Impulses (The Drunken Monkey Mind)
  else if (storyId === 'story_restless_monkey_mind' || text.includes('addiction') || text.includes('habit') || text.includes('porn') || text.includes('lust') || text.includes('control')) {
    return {
      type: 'addiction_discipline',
      title: 'Mastery Over Mind (The Drunken Monkey)',
      primaryColor: '#c084fc',
      secondaryColor: '#9333ea',
      accentColor: '#f43f5e',
      bgGradient: ['#190829', '#08020d'],
      emblem: 'stillness_mandala',
      raysCount: 24,
      petalsCount: 18,
      particleSpeed: 1.3,
      particleColor: 'rgba(192, 132, 252, ',
      sceneTitle1: 'The Restless Stings of Craving & Impulse',
      sceneTitle2: 'The Drunken Monkey Stung by the Scorpion',
      sceneTitle3: 'Awakening: The Calm Unshaken Silent Witness',
      sceneTitle4: 'Mahavakya: Master the Mind, Conquer the Universe'
    };
  }
  // 12. Jealousy vs Seva (Golden Plate of Heaven)
  else if (storyId === 'story_golden_plate_sacrifice' || text.includes('jealousy') || text.includes('envy') || text.includes('jalan') || text.includes('selfish') || text.includes('seva')) {
    return {
      type: 'jealousy_seva',
      title: 'Celestial Gold (They Live Who Live for Others)',
      primaryColor: '#fbbf24',
      secondaryColor: '#d97706',
      accentColor: '#f59e0b',
      bgGradient: ['#211603', '#0a0701'],
      emblem: 'golden_plate',
      raysCount: 32,
      petalsCount: 16,
      particleSpeed: 1.5,
      particleColor: 'rgba(251, 191, 36, ',
      sceneTitle1: 'The Corrosion of Comparison & Jealousy',
      sceneTitle2: 'The Heavenly Golden Plate Turning to Lead',
      sceneTitle3: 'Awakening: The Poor Peasant’s Pure Compassion',
      sceneTitle4: 'Mahavakya: They Alone Live Who Live for Others'
    };
  }
  // 13. Giving Up & Hopelessness (The Rock of Kanyakumari)
  else if (storyId === 'story_kanyakumari_rock' || text.includes('give up') || text.includes('hopeless') || text.includes('tired') || text.includes('haar') || text.includes('quit')) {
    return {
      type: 'perseverance_exhaustion',
      title: 'Rock Determination (Never Surrender)',
      primaryColor: '#0284c7',
      secondaryColor: '#0369a1',
      accentColor: '#f5cf62',
      bgGradient: ['#031726', '#01080e'],
      emblem: 'ocean_rock',
      raysCount: 28,
      petalsCount: 12,
      particleSpeed: 2.2,
      particleColor: 'rgba(2, 132, 199, ',
      sceneTitle1: 'The Edge of Exhaustion & Complete Despair',
      sceneTitle2: 'Swimming Through the Shark Waves to the Rock',
      sceneTitle3: 'Awakening: Three Days of Unbroken Cosmic Vision',
      sceneTitle4: 'Mahavakya: Arise! Great Work Requires Unyielding Grit'
    };
  }
  // 14. Relationships & Pure Friendship (Sister Nivedita Dedication)
  else if (storyId === 'story_sister_nivedita_friendship' || text.includes('friend') || text.includes('friendship') || text.includes('relation') || text.includes('betrayal') || text.includes('prem')) {
    return {
      type: 'relationships_friendship',
      title: 'Sacred Partnership (Love That Liberates)',
      primaryColor: '#f43f5e',
      secondaryColor: '#e11d48',
      accentColor: '#fde047',
      bgGradient: ['#22060e', '#0b0104'],
      emblem: 'sacred_bond',
      raysCount: 26,
      petalsCount: 14,
      particleSpeed: 1.4,
      particleColor: 'rgba(244, 63, 94, ',
      sceneTitle1: 'The Clinging Bonds of Dependency & Hurt',
      sceneTitle2: 'Chiseling Sister Nivedita: Truth Over Flattery',
      sceneTitle3: 'Awakening: Love That Elevates, Never Possesses',
      sceneTitle4: 'Mahavakya: Pure Friendship Sees the Divine in All'
    };
  }
  // Procedural Custom fallback
  else {
    const hue = seed % 360;
    return {
      type: 'procedural_custom',
      title: 'Personalized Seeker Journey',
      primaryColor: `hsl(${hue}, 85%, 60%)`,
      secondaryColor: `hsl(${(hue + 40) % 360}, 80%, 50%)`,
      accentColor: '#d4af37',
      bgGradient: [`hsl(${hue}, 60%, 10%)`, `hsl(${hue}, 40%, 3%)`],
      emblem: 'mandala_aura',
      raysCount: 16 + (seed % 16),
      petalsCount: 8 + (seed % 8),
      particleSpeed: 1.0 + (seed % 10) * 0.1,
      particleColor: `hsla(${hue}, 80%, 60%, `,
      sceneTitle1: 'The Inner Questioning & Seeker Dilemma',
      sceneTitle2: 'Timeless Wisdom from Swami Vivekananda',
      sceneTitle3: 'Awakening of Supreme Inner Will',
      sceneTitle4: 'The Eternal Mahavakya Slogan'
    };
  }
}

// ==========================================
// VIVEK VANI MULTI-LANGUAGE HD VIDEO CATALOG & PLAYER
// 8 Authentic Life Themes, 3 Languages Each (Real MP4 with Embedded Audio)
// ==========================================
const VIDEO_CATALOG = {
  fear_courage: {
    id: "confidence_tiger",
    title: {
      english: "Fear of Failure & Tiger Courage",
      hindi: "असफलता का भय एवं सिंह सा साहस",
      hinglish: "Fear of Failure & Tiger Courage"
    },
    icon: "⚡",
    keywords: ["fear", "exam", "failure", "anxiety", "darr", "bhay", "courage", "tiger", "confidence", "panic", "pariksha", "nervous"],
    videos: {
      english: "assets/videos/confidence_tiger_01_en.mp4",
      hindi: "assets/videos/confidence_tiger_01_hi.mp4",
      hinglish: "assets/videos/confidence_tiger_01_hing.mp4"
    }
  },
  focus_discipline: {
    id: "focus_study",
    title: {
      english: "Phone Addiction, Focus & Deep Study",
      hindi: "मोबाइल लत, एकाग्रता एवं अध्ययन",
      hinglish: "Phone Addiction, Focus & Deep Study"
    },
    icon: "📱",
    keywords: ["focus", "study", "phone", "reels", "addiction", "distraction", "discipline", "ekagrata", "padhai", "mind", "concentration"],
    videos: {
      english: "assets/videos/focus_study_01_en.mp4",
      hindi: "assets/videos/focus_study_01_hi.mp4",
      hinglish: "assets/videos/focus_study_01_hing.mp4"
    }
  },
  stress_calm: {
    id: "stress_calm",
    title: {
      english: "Overcoming Stress & Calming the Mind",
      hindi: "तनाव निवारण एवं मानसिक शांति",
      hinglish: "Overcoming Stress & Calming the Mind"
    },
    icon: "🧘",
    keywords: ["stress", "tension", "calm", "overwhelmed", "peace", "anxious", "tanav", "shanti", "sukoon", "pressure", "exhaustion"],
    videos: {
      english: "assets/videos/stress_calm_01_en.mp4",
      hindi: "assets/videos/stress_calm_01_hi.mp4",
      hinglish: "assets/videos/stress_calm_01_hing.mp4"
    }
  },
  rejection_heartbreak: {
    id: "heartbreak_healing",
    title: {
      english: "Rejection, Heartbreak & Healing",
      hindi: "हृदय-पीड़ा, उपेक्षा एवं आत्म-सम्मान",
      hinglish: "Rejection, Heartbreak & Healing"
    },
    icon: "💔",
    keywords: ["heartbreak", "breakup", "rejection", "inferior", "worthless", "love", "pain", "dard", "self-esteem", "insult", "relationship"],
    videos: {
      english: "assets/videos/heartbreak_healing_01_en.mp4",
      hindi: "assets/videos/heartbreak_healing_01_hi.mp4",
      hinglish: "assets/videos/heartbreak_healing_01_hing.mp4"
    }
  },
  anger_patience: {
    id: "anger_calm",
    title: {
      english: "Mastering Anger & Inner Patience",
      hindi: "क्रोध पर नियंत्रण एवं अगाध धैर्य",
      hinglish: "Mastering Anger & Inner Patience"
    },
    icon: "🔥",
    keywords: ["anger", "gussa", "irritation", "krodh", "calm", "patience", "temper", "dhairya", "scorpion", "temperament"],
    videos: {
      english: "assets/videos/anger_calm_01_en.mp4",
      hindi: "assets/videos/anger_calm_01_hi.mp4",
      hinglish: "assets/videos/anger_calm_01_hing.mp4"
    }
  },
  health_vitality: {
    id: "health_vitality",
    title: {
      english: "Physical Strength, Fitness & Vital Energy",
      hindi: "शारीरिक सामर्थ्य, स्वास्थ्य एवं ओज",
      hinglish: "Physical Strength, Fitness & Vital Energy"
    },
    icon: "🏋️",
    keywords: ["health", "strength", "weakness", "lethargy", "fatigue", "energy", "vitality", "body", "shareer", "kamzori", "football", "gym"],
    videos: {
      english: "assets/videos/health_vitality_01_en.mp4",
      hindi: "assets/videos/health_vitality_01_hi.mp4",
      hinglish: "assets/videos/health_vitality_01_hing.mp4"
    }
  },
  money_growth: {
    id: "money_growth",
    title: {
      english: "Career, Wealth & Overcoming Scarcity",
      hindi: "आजीविका, धन एवं समृद्धि",
      hinglish: "Career, Wealth & Overcoming Scarcity"
    },
    icon: "💰",
    keywords: ["money", "career", "job", "poverty", "wealth", "growth", "finance", "paise", "naukri", "garibi", "dakshineswar", "unemployed"],
    videos: {
      english: "assets/videos/money_growth_01_en.mp4",
      hindi: "assets/videos/money_growth_01_hi.mp4",
      hinglish: "assets/videos/money_growth_01_hing.mp4"
    }
  },
  loneliness_connection: {
    id: "loneliness_connection",
    title: {
      english: "Loneliness, Grief & Divine Connection",
      hindi: "अकेलापन, शोक एवं आत्म-संबंध",
      hinglish: "Loneliness, Grief & Divine Connection"
    },
    icon: "🌌",
    keywords: ["lonely", "loneliness", "alone", "isolated", "grief", "loss", "connection", "akela", "friendship", "friend", "nivedita"],
    videos: {
      english: "assets/videos/loneliness_connection_01_en.mp4",
      hindi: "assets/videos/loneliness_connection_01_hi.mp4",
      hinglish: "assets/videos/loneliness_connection_01_hing.mp4"
    }
  }
};

function getVideoLangKey(lang) {
  if (lang === 'hindi') return 'hindi';
  if (lang === 'english') return 'english';
  return 'hinglish';
}

function loadVivekVaniVideo(themeKey, lang, autoPlay = false) {
  if (!VIDEO_CATALOG[themeKey]) {
    themeKey = 'fear_courage';
  }
  const langKey = getVideoLangKey(lang || AppState.currentVideoLang || AppState.currentLang);
  AppState.currentVideoTheme = themeKey;
  AppState.currentVideoLang = langKey;

  const catalogItem = VIDEO_CATALOG[themeKey];
  const videoUrl = catalogItem.videos[langKey] || catalogItem.videos.hinglish;

  const videoEl = document.getElementById('vivekVaniRealVideo');
  if (videoEl) {
    const curSrc = videoEl.getAttribute('data-active-src') || '';
    if (curSrc !== videoUrl) {
      videoEl.setAttribute('data-active-src', videoUrl);
      videoEl.src = videoUrl;
      videoEl.load();
      if (autoPlay) {
        videoEl.play().catch(() => {});
      }
    }
  }

  // Update Topic Title & Badge
  const topicTitle = catalogItem.title[langKey] || catalogItem.title.hinglish;
  const tagEl = document.getElementById('videoTopicTag');
  if (tagEl) {
    tagEl.innerText = `${catalogItem.icon} ${topicTitle}`;
  }
  const badgeTitleEl = document.getElementById('videoThemeBadgeTitle');
  if (badgeTitleEl) {
    badgeTitleEl.innerText = langKey === 'hindi' ? 'स्वामी जी वीडियो प्रवचन' : 'Vivek Vani HD Video';
  }

  // Update Language Pills
  ['Hing', 'Hi', 'En'].forEach(suffix => {
    const btn = document.getElementById(`vlangBtn${suffix}`);
    if (btn) btn.classList.remove('active');
  });
  if (langKey === 'hinglish') document.getElementById('vlangBtnHing')?.classList.add('active');
  if (langKey === 'hindi') document.getElementById('vlangBtnHi')?.classList.add('active');
  if (langKey === 'english') document.getElementById('vlangBtnEn')?.classList.add('active');

  // Update Carousel Active Chip
  document.querySelectorAll('.vdisc-chip').forEach(c => c.classList.remove('active'));
  document.getElementById(`vchip_${themeKey}`)?.classList.add('active');
}

function switchVideoLang(targetLang) {
  const videoEl = document.getElementById('vivekVaniRealVideo');
  const wasPlaying = videoEl ? !videoEl.paused : false;
  const curTime = videoEl ? videoEl.currentTime : 0;

  const langKey = getVideoLangKey(targetLang);
  loadVivekVaniVideo(AppState.currentVideoTheme || 'fear_courage', langKey, wasPlaying);

  if (videoEl && curTime > 0) {
    videoEl.addEventListener('loadedmetadata', function onMeta() {
      videoEl.currentTime = Math.min(curTime, videoEl.duration || curTime);
      videoEl.removeEventListener('loadedmetadata', onMeta);
      if (wasPlaying) videoEl.play().catch(() => {});
    });
  }

  const toastLangMap = {
    english: "🎙️ Video audio switched to English ✓",
    hindi: "🎙️ वीडियो ऑडियो हिंदी में सेट हुआ ✓",
    hinglish: "🎙️ Video audio switched to Hinglish ✓"
  };
  showToast(toastLangMap[langKey] || "Video audio language updated");
}

function selectVideoTheme(themeKey) {
  loadVivekVaniVideo(themeKey, AppState.currentVideoLang || AppState.currentLang, true);
  const item = VIDEO_CATALOG[themeKey];
  if (item) {
    const langKey = getVideoLangKey(AppState.currentVideoLang || AppState.currentLang);
    showToast(`🎬 Loaded: ${item.icon} ${item.title[langKey] || item.title.hinglish}`);
  }
}

function toggleVideoPlayerMode() {
  const currentMode = AppState.videoPlayerMode || 'real';
  const newMode = currentMode === 'real' ? 'canvas' : 'real';
  AppState.videoPlayerMode = newMode;

  const realVideo = document.getElementById('vivekVaniRealVideo');
  const canvas = document.getElementById('aiVideoCanvas');
  const canvasControls = document.getElementById('canvasControlBar');
  const modeIcon = document.getElementById('videoModeIcon');
  const modeLabel = document.getElementById('videoModeLabel');

  if (newMode === 'canvas') {
    if (realVideo) {
      realVideo.pause();
      realVideo.style.display = 'none';
    }
    if (canvas) canvas.style.display = 'block';
    if (canvasControls) canvasControls.style.display = 'flex';
    if (modeIcon) modeIcon.innerText = '🎬';
    if (modeLabel) modeLabel.innerText = 'HD Video Mode';
    showToast("🎨 Switched to Generative Storyboard Canvas");
    if (!AppState.isVideoPlaying) toggleVideoPlayback();
  } else {
    stopVideoPlaybackClean();
    if (canvas) canvas.style.display = 'none';
    if (canvasControls) canvasControls.style.display = 'none';
    if (realVideo) {
      realVideo.style.display = 'block';
      realVideo.play().catch(() => {});
    }
    if (modeIcon) modeIcon.innerText = '🎨';
    if (modeLabel) modeLabel.innerText = 'Canvas Mode';
    showToast("🎬 Switched to Multi-Language HD Video");
  }
}

function matchVideoThemeFromGuidance(data) {
  if (!data) return 'fear_courage';
  
  // Check category or story_id first
  const storyId = data.story_id || data.story?.id || '';
  if (storyId.includes('monkeys') || storyId.includes('lion')) return 'fear_courage';
  if (storyId.includes('river') || storyId.includes('monkey_mind')) return 'focus_discipline';
  if (storyId.includes('football')) return 'health_vitality';
  if (storyId.includes('dakshineswar')) return 'money_growth';
  if (storyId.includes('scorpion')) return 'anger_patience';
  if (storyId.includes('father_loss') || storyId.includes('nivedita')) return 'loneliness_connection';
  if (storyId.includes('kanyakumari')) return 'stress_calm';

  // Check text content keywords
  const text = `${data.story?.title || ''} ${data.story?.text || ''} ${document.getElementById('userSituationInput')?.value || ''}`.toLowerCase();
  for (const [key, item] of Object.entries(VIDEO_CATALOG)) {
    for (const kw of item.keywords) {
      if (text.includes(kw)) {
        return key;
      }
    }
  }
  return 'fear_courage';
}

function initAiVideoCanvas() {
  const canvas = document.getElementById('aiVideoCanvas');
  if (!canvas) return;
  canvas.width = 1280;
  canvas.height = 720;

  // Initialize ambient dust particles
  AppState.videoParticles = [];
  for (let i = 0; i < 90; i++) {
    AppState.videoParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.6,
      vy: (Math.random() - 0.5) * 1.6,
      size: Math.random() * 3.5 + 1,
      alpha: Math.random() * 0.7 + 0.3,
      phase: Math.random() * Math.PI * 2
    });
  }

  // Initialize ascending fiery embers
  AppState.videoEmbers = [];
  for (let i = 0; i < 55; i++) {
    AppState.videoEmbers.push({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 200,
      vy: -(Math.random() * 2.4 + 1.2),
      size: Math.random() * 3.8 + 1.5,
      alpha: Math.random() * 0.8 + 0.2,
      wiggle: Math.random() * Math.PI * 2
    });
  }

  // Initialize descending blessing lotus petals
  AppState.videoPetals = [];
  for (let i = 0; i < 40; i++) {
    AppState.videoPetals.push({
      x: Math.random() * canvas.width,
      y: -Math.random() * 350,
      vy: Math.random() * 1.4 + 0.8,
      vx: Math.sin(i) * 0.9,
      size: Math.random() * 9 + 6,
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.05
    });
  }

  // Preload portrait images
  AppState.videoImgVivek = new Image();
  AppState.videoImgVivek.src = 'assets/vivekananda.jpg';

  AppState.videoImgMeditation = new Image();
  AppState.videoImgMeditation.src = 'assets/logo.jpg';

  const initialGuidance = getDefaultInitialGuidance();
  if (!AppState.currentGuidance) AppState.currentGuidance = initialGuidance;
  initVideoTimeline(initialGuidance);
  renderVideoFrame(0, initialGuidance);
  updateVideoProgressUI();
}

function startVideoAnimation(guidance) {
  guidance = guidance || AppState.currentGuidance || getDefaultInitialGuidance();
  AppState.currentGuidance = guidance;
  initVideoTimeline(guidance);

  stopAmbientSound(); // Kill any background noise immediately!
  AppState.isVideoPlaying = true;
  AppState.isAudioPlaying = true;
  AppState.currentScene = 1;
  AppState.videoCurrentTime = 0;
  
  const playBtn = document.getElementById('videoPlayPauseBtn');
  if (playBtn) playBtn.innerText = '⏸';
  const audioBtn = document.getElementById('voicePlayPauseBtn');
  if (audioBtn) audioBtn.innerHTML = '⏸';

  cancelAnimationFrame(AppState.videoAnimFrameId);
  clearTimeout(AppState.scenePauseTimer);

  // Auto-start Swami ji's synchronized baritone voice dictation from beginning!
  if (!AppState.isSwamiVoiceMuted) {
    speakSceneNarrationForVideo(1, guidance, 0);
  } else {
    scheduleMutedSceneAdvance(1, guidance);
  }

  let lastTimestamp = performance.now();
  function videoLoop(now) {
    if (!AppState.isVideoPlaying) return;

    const delta = (now - lastTimestamp) / 1000;
    lastTimestamp = now;

    const curScene = AppState.currentScene || 1;
    const sceneEnd = AppState.videoTimeline?.starts[curScene] ?? AppState.videoTotalDuration;

    // While speech is actively dictating this scene, hold at boundary rather than spilling over
    if (AppState.isSpeechActive && AppState.videoCurrentTime >= sceneEnd - 0.2) {
      AppState.videoCurrentTime = sceneEnd - 0.15;
    } else {
      AppState.videoCurrentTime += delta;
      if (AppState.videoCurrentTime >= AppState.videoTotalDuration) {
        AppState.videoCurrentTime = AppState.videoTotalDuration;
      }
    }

    renderVideoFrame(AppState.videoCurrentTime, guidance);
    updateVideoProgressUI();

    AppState.videoAnimFrameId = requestAnimationFrame(videoLoop);
  }
  AppState.videoAnimFrameId = requestAnimationFrame(videoLoop);
}

function toggleVideoPlayback() {
  if (AppState.isVideoPlaying) {
    // PAUSE
    AppState.isVideoPlaying = false;
    AppState.isAudioPlaying = false;
    cancelAnimationFrame(AppState.videoAnimFrameId);
    clearTimeout(AppState.scenePauseTimer);
    if (AppState.activeSpeechUtterance) {
      AppState.activeSpeechUtterance.onend = null;
      AppState.activeSpeechUtterance.onerror = null;
      AppState.activeSpeechUtterance = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    stopAmbientSound();

    const playBtn = document.getElementById('videoPlayPauseBtn');
    if (playBtn) playBtn.innerText = '▶';
    const audioBtn = document.getElementById('voicePlayPauseBtn');
    if (audioBtn) audioBtn.innerHTML = '▶';
    const pillText = document.getElementById('videoVoiceStatusText');
    if (pillText) pillText.innerText = 'Swami ji Voice: Paused';
  } else {
    // RESUME / PLAY
    const guidance = AppState.currentGuidance || getDefaultInitialGuidance();
    AppState.currentGuidance = guidance;
    if (!AppState.videoTimeline) initVideoTimeline(guidance);

    // If completed or near the end, restart cleanly from Scene 1, Time 0!
    if (AppState.videoCurrentTime >= AppState.videoTotalDuration - 0.5) {
      AppState.videoCurrentTime = 0;
      AppState.currentScene = 1;
      AppState.lastSpokenScene = -1;
    }

    AppState.isVideoPlaying = true;
    AppState.isAudioPlaying = true;
    const playBtn = document.getElementById('videoPlayPauseBtn');
    if (playBtn) playBtn.innerText = '⏸';
    const audioBtn = document.getElementById('voicePlayPauseBtn');
    if (audioBtn) audioBtn.innerHTML = '⏸';

    cancelAnimationFrame(AppState.videoAnimFrameId);
    let lastTimestamp = performance.now();
    function resumeLoop(now) {
      if (!AppState.isVideoPlaying) return;
      const delta = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      const curScene = AppState.currentScene || 1;
      const sceneEnd = AppState.videoTimeline?.starts[curScene] ?? AppState.videoTotalDuration;

      if (AppState.isSpeechActive && AppState.videoCurrentTime >= sceneEnd - 0.2) {
        AppState.videoCurrentTime = sceneEnd - 0.15;
      } else {
        AppState.videoCurrentTime += delta;
        if (AppState.videoCurrentTime >= AppState.videoTotalDuration) {
          AppState.videoCurrentTime = AppState.videoTotalDuration;
        }
      }

      renderVideoFrame(AppState.videoCurrentTime, AppState.currentGuidance);
      updateVideoProgressUI();
      AppState.videoAnimFrameId = requestAnimationFrame(resumeLoop);
    }
    AppState.videoAnimFrameId = requestAnimationFrame(resumeLoop);

    if (!AppState.isSwamiVoiceMuted) {
      speakSceneNarrationForVideo(AppState.currentScene || 1, guidance, AppState.videoCurrentTime);
    } else {
      scheduleMutedSceneAdvance(AppState.currentScene || 1, guidance);
    }
  }
}

function jumpToVideoScene(sceneNum, explicitTime) {
  sceneNum = Math.max(1, Math.min(4, Number(sceneNum)));
  clearTimeout(AppState.scenePauseTimer);
  if (AppState.activeSpeechUtterance) {
    AppState.activeSpeechUtterance.onend = null;
    AppState.activeSpeechUtterance.onerror = null;
    AppState.activeSpeechUtterance = null;
  }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  stopAmbientSound();

  const guidance = AppState.currentGuidance || getDefaultInitialGuidance();
  AppState.currentGuidance = guidance;
  if (!AppState.videoTimeline) initVideoTimeline(guidance);

  AppState.currentScene = sceneNum;
  if (typeof explicitTime === 'number') {
    AppState.videoCurrentTime = Math.max(0, Math.min(AppState.videoTotalDuration, explicitTime));
  } else {
    AppState.videoCurrentTime = AppState.videoTimeline.starts[sceneNum - 1];
  }

  renderVideoFrame(AppState.videoCurrentTime, guidance);
  updateVideoProgressUI();

  if (!AppState.isVideoPlaying) {
    AppState.isVideoPlaying = true;
    AppState.isAudioPlaying = true;
    const playBtn = document.getElementById('videoPlayPauseBtn');
    if (playBtn) playBtn.innerText = '⏸';
    const audioBtn = document.getElementById('voicePlayPauseBtn');
    if (audioBtn) audioBtn.innerHTML = '⏸';

    cancelAnimationFrame(AppState.videoAnimFrameId);
    let lastTimestamp = performance.now();
    function jumpLoop(now) {
      if (!AppState.isVideoPlaying) return;
      const delta = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      const curScene = AppState.currentScene || 1;
      const sceneEnd = AppState.videoTimeline?.starts[curScene] ?? AppState.videoTotalDuration;

      if (AppState.isSpeechActive && AppState.videoCurrentTime >= sceneEnd - 0.2) {
        AppState.videoCurrentTime = sceneEnd - 0.15;
      } else {
        AppState.videoCurrentTime += delta;
        if (AppState.videoCurrentTime >= AppState.videoTotalDuration) {
          AppState.videoCurrentTime = AppState.videoTotalDuration;
        }
      }

      renderVideoFrame(AppState.videoCurrentTime, AppState.currentGuidance);
      updateVideoProgressUI();
      AppState.videoAnimFrameId = requestAnimationFrame(jumpLoop);
    }
    AppState.videoAnimFrameId = requestAnimationFrame(jumpLoop);
  }

  if (!AppState.isSwamiVoiceMuted) {
    speakSceneNarrationForVideo(sceneNum, guidance, AppState.videoCurrentTime);
  } else {
    scheduleMutedSceneAdvance(sceneNum, guidance);
  }
}

function renderVideoFrame(time, guidance) {
  const canvas = document.getElementById('aiVideoCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  const userQuery = document.getElementById('userSituationInput')?.value || '';
  const theme = getVideoTheme(guidance, userQuery);

  // Background dynamic atmospheric radial gradient
  const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 60, w / 2, h / 2, w * 0.85);
  bgGrad.addColorStop(0, theme.bgGradient[0]);
  bgGrad.addColorStop(1, theme.bgGradient[1]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtitles sequence across 90 seconds
  const defaultSubs = [
    "Do not run away from failure... Turn around and face the storm!",
    "Stand firm like a lion staring into difficulties!",
    "All infinite power and courage already exist within your soul...",
    "Strength is life, weakness is death! Arise and conquer all despair."
  ];
  const subtitles = guidance?.video_subtitles && guidance.video_subtitles.length >= 4 
    ? guidance.video_subtitles 
    : defaultSubs;

  const activeScene = AppState.currentScene || 1;
  const sceneStartTime = AppState.videoTimeline?.starts[activeScene - 1] ?? ((activeScene - 1) * 8.0);
  const sceneDuration = AppState.videoTimeline?.durations[activeScene - 1] ?? 8.0;
  const sceneProgress = Math.max(0, Math.min(1, (time - sceneStartTime) / sceneDuration));

  // --- SCENE 1: The Seeker's Dilemma & Inner Tempest (0:00 - 0:22) ---
  if (activeScene === 1) {
    // 1. Moving wind streaks & storm atmosphere
    ctx.save();
    for (let i = 0; i < 18; i++) {
      const y = (i * 42 + time * 60) % h;
      const xStart = (Math.sin(time + i) * 100 + w * 0.1);
      const xEnd = xStart + 280 + Math.cos(time + i) * 80;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.04 + Math.sin(time * 2 + i) * 0.03})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(xStart, y);
      ctx.lineTo(xEnd, y - 10);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Swirling turbulent particle storm
    if (AppState.videoParticles) {
      AppState.videoParticles.forEach(p => {
        p.x += p.vx * theme.particleSpeed;
        p.y += p.vy * theme.particleSpeed;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.fillStyle = `${theme.particleColor}${p.alpha * 0.75})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 3. Central pulsing soul-core aura (breathing in meditation)
    const pulse = Math.sin(time * 2.4) * 28 + 165;
    const pulseGrad = ctx.createRadialGradient(w / 2, h * 0.43, 25, w / 2, h * 0.43, pulse);
    pulseGrad.addColorStop(0, `rgba(212, 175, 55, 0.45)`);
    pulseGrad.addColorStop(0.5, `${theme.particleColor}0.18)`);
    pulseGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = pulseGrad;
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.43, pulse, 0, Math.PI * 2);
    ctx.fill();

    // 4. Seeker meditation silhouette
    if (AppState.videoImgMeditation && AppState.videoImgMeditation.complete) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.43, 130, 0, Math.PI * 2);
      ctx.clip();
      const zoom = 1.0 + sceneProgress * 0.1;
      ctx.translate(w / 2, h * 0.43);
      ctx.scale(zoom, zoom);
      ctx.drawImage(AppState.videoImgMeditation, -150, -150, 300, 300);
      ctx.restore();

      // Golden glowing ring border
      ctx.strokeStyle = theme.accentColor;
      ctx.lineWidth = 3;
      ctx.shadowColor = theme.primaryColor;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.43, 132, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Kinetic title & scene guidance
    ctx.font = 'bold 26px "Philosopher", serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.primaryColor;
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 8;
    ctx.fillText(`🌪️ ${theme.sceneTitle1}`, w / 2, 70);
    ctx.shadowBlur = 0;

    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('Searching within the inner storm • Seeking courage and guidance', w / 2, 102);
  }

  // --- SCENE 2: The Master\'s Vision & Parable in Motion (0:22 - 0:45) ---
  else if (activeScene === 2) {
    // 1. Procedural animated backdrop tailored to the story
    if (theme.type === 'focus_discipline' || theme.type === 'anger_patience') {
      // Flowing sacred river with moving water waves
      for (let i = 0; i < 6; i++) {
        const waveY = h * 0.58 + i * 26;
        ctx.beginPath();
        ctx.moveTo(0, waveY);
        for (let x = 0; x <= w; x += 30) {
          const y = waveY + Math.sin(x * 0.015 + time * 3 + i) * 12;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(0, 210, 255, ${0.15 - i * 0.02})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      // Floating target eggshells drifting across water
      for (let j = 0; j < 5; j++) {
        const eggX = ((time * 80 + j * 240) % (w + 60)) - 30;
        const eggY = h * 0.65 + Math.sin(eggX * 0.02 + time * 2) * 8;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(eggX, eggY, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        // Laser aimline
        if (j === 2) {
          ctx.strokeStyle = '#ff3366';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(w * 0.15, h * 0.5);
          ctx.lineTo(eggX, eggY);
          ctx.stroke();
        }
      }
    } else if (theme.type === 'perseverance_exhaustion') {
      // Kanyakumari rock & roaring ocean waves
      ctx.save();
      for (let i = 0; i < 5; i++) {
        const waveY = h * 0.6 + i * 24;
        ctx.beginPath();
        ctx.moveTo(0, waveY);
        for (let x = 0; x <= w; x += 25) {
          const y = waveY + Math.sin(x * 0.02 + time * 4 + i) * 16;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(2, 132, 199, ${0.3 - i * 0.04})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      // Sacred Rock silhouette
      ctx.fillStyle = '#061320';
      ctx.beginPath();
      ctx.moveTo(w * 0.65, h);
      ctx.lineTo(w * 0.72, h * 0.54);
      ctx.lineTo(w * 0.88, h * 0.58);
      ctx.lineTo(w * 0.95, h);
      ctx.fill();
      // Lighthouse beacon sweep
      const beaconAngle = time * 0.8;
      ctx.strokeStyle = 'rgba(245, 207, 98, 0.35)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(w * 0.8, h * 0.55);
      ctx.lineTo(w * 0.8 + Math.cos(beaconAngle) * 450, h * 0.55 + Math.sin(beaconAngle) * 200);
      ctx.stroke();
      ctx.restore();
    } else {
      // Sunrise celestial rays sweeping from bottom
      const sunGrad = ctx.createLinearGradient(0, h, 0, 0);
      sunGrad.addColorStop(0, 'rgba(255, 115, 0, 0.4)');
      sunGrad.addColorStop(0.5, 'rgba(212, 175, 55, 0.2)');
      sunGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, w, h);
    }

    // 2. Rotating Sacred Geometry Mandala
    ctx.save();
    ctx.translate(w / 2, h * 0.42);
    ctx.rotate(time * 0.14);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
    ctx.lineWidth = 1.5;

    for (let r = 70; r <= 220; r += 50) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    const petals = theme.petalsCount || 12;
    for (let i = 0; i < petals; i++) {
      const angle = (i * 2 * Math.PI) / petals;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(35, 120, 0, 220);
      ctx.quadraticCurveTo(-35, 120, 0, 0);
      ctx.strokeStyle = `rgba(245, 207, 98, ${0.2 + (i % 2) * 0.2})`;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // 3. Central Swami Vivekananda Portrait with Ken Burns Zoom
    const portraitImg = AppState.videoImgVivek || AppState.videoLoadedImage;
    if (portraitImg && portraitImg.complete) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.42, 140, 0, Math.PI * 2);
      ctx.clip();
      const zoom = 1.0 + sceneProgress * 0.14;
      ctx.translate(w / 2, h * 0.42);
      ctx.scale(zoom, zoom);
      ctx.drawImage(portraitImg, -160, -160, 320, 320);
      ctx.restore();

      // Radiant gold ring
      ctx.strokeStyle = '#f5cf62';
      ctx.lineWidth = 4;
      ctx.shadowColor = 'rgba(212, 175, 55, 0.9)';
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.42, 142, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Story Title
    ctx.font = 'bold 24px "Philosopher", serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff9100';
    ctx.fillText(`📖 ${guidance?.story?.title || theme.sceneTitle2}`, w / 2, 70);

    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#f5cf62';
    ctx.fillText('Historical Parable from Swami Vivekananda’s Journey', w / 2, 100);
  }

  // --- SCENE 3: The Awakening of Infinite Power (0:45 - 1:08) ---
  else if (activeScene === 3) {
    // 1. Expanding circular shockwaves
    for (let i = 0; i < 4; i++) {
      const waveRadius = ((time * 85 + i * 100) % 380) + 50;
      const alpha = Math.max(0, 1 - waveRadius / 430);
      ctx.strokeStyle = `${theme.particleColor}${alpha * 0.8})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(w / 2, h * 0.42, waveRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Ascending golden energy embers geyser
    if (AppState.videoEmbers) {
      AppState.videoEmbers.forEach(e => {
        e.y += e.vy * theme.particleSpeed;
        e.x += Math.sin(time * 3 + e.wiggle) * 1.0;
        if (e.y < 0) e.y = h + Math.random() * 50;

        ctx.fillStyle = `rgba(245, 207, 98, ${e.alpha})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 3. Central Animated Category Emblem
    ctx.save();
    ctx.translate(w / 2, h * 0.42);

    if (theme.emblem === 'lion_fire') {
      // Roaring Fiery Lion Crest
      ctx.strokeStyle = '#ff5722';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#ff3d00';
      ctx.shadowBlur = 32;
      for (let i = 0; i < 20; i++) {
        const rayA = (i * Math.PI * 2) / 20 + time * 0.4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(rayA) * 95, Math.sin(rayA) * 95);
        ctx.lineTo(Math.cos(rayA) * 175, Math.sin(rayA) * 175);
        ctx.stroke();
      }
      ctx.font = '76px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🦁', 0, 0);

    } else if (theme.emblem === 'target_lotus') {
      // Concentric Laser Target & Lotus
      ctx.strokeStyle = '#00d2ff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00d2ff';
      ctx.shadowBlur = 22;
      for (let r = 40; r <= 155; r += 35) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(-170, 0); ctx.lineTo(170, 0);
      ctx.moveTo(0, -170); ctx.lineTo(0, 170);
      ctx.stroke();
      ctx.font = '70px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🪷', 0, 0);

    } else if (theme.emblem === 'vitality_chakra') {
      // 12-Spoke Spinning Vitality Chakra
      ctx.rotate(time * 0.6);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 28;
      ctx.beginPath();
      ctx.arc(0, 0, 135, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI * 2) / 12;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * 135, Math.sin(a) * 135);
        ctx.stroke();
      }
      ctx.rotate(-time * 0.6);
      ctx.font = '72px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡', 0, 0);

    } else if (theme.emblem === 'lotus_shield') {
      // Luminous Lotus Shield
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(0, 0, 135, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = '76px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🛡️', 0, 0);

    } else if (theme.emblem === 'temple_flame') {
      // Golden Temple Flame
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(0, 0, 135, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = '76px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🪔', 0, 0);

    } else if (theme.emblem === 'celestial_atman') {
      // Celestial Atman
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 28;
      ctx.beginPath();
      ctx.arc(0, 0, 130, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = '76px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌌', 0, 0);

    } else if (theme.emblem === 'hands_unity') {
      // Unity & Fellowship
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 28;
      ctx.beginPath();
      ctx.arc(0, 0, 130, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = '74px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🤝', 0, 0);

    } else if (theme.emblem === 'golden_plate') {
      // Golden Plate of Heaven
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 35;
      ctx.beginPath();
      ctx.arc(0, 0, 130, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = '76px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌟', 0, 0);

    } else if (theme.emblem === 'ocean_rock') {
      // Kanyakumari Rock & Waves
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(0, 0, 135, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = '76px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌊', 0, 0);

    } else if (theme.emblem === 'royal_crown') {
      // Starlight Constellation Crown
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#d946ef';
      ctx.shadowBlur = 26;
      ctx.beginPath();
      ctx.arc(0, 0, 128, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = '74px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('👑', 0, 0);

    } else {
      // Cosmic Compass of Destiny
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 26;
      ctx.beginPath();
      ctx.arc(0, 0, 130, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 16; i++) {
        const a = (i * Math.PI * 2) / 16 + time * 0.2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 110, Math.sin(a) * 110);
        ctx.lineTo(Math.cos(a) * 140, Math.sin(a) * 140);
        ctx.stroke();
      }
      ctx.font = '72px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🧭', 0, 0);
    }
    ctx.restore();

    // Scene Title
    ctx.font = 'bold 24px "Philosopher", serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.primaryColor;
    ctx.shadowBlur = 0;
    ctx.fillText(`⚡ ${theme.sceneTitle3}`, w / 2, 70);

    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#f5cf62';
    ctx.fillText('Awakening of Divine Willpower & Supreme Resilience', w / 2, 100);
  }

  // --- SCENE 4: The Eternal Mahavakya Mantra & Supreme Triumph (1:08 - 1:30) ---
  else {
    // 1. 36 Volumetric God-Rays rotating across the cosmos
    ctx.save();
    ctx.translate(w / 2, h * 0.42);
    ctx.rotate(time * 0.05);
    const rays = 36;
    for (let i = 0; i < rays; i++) {
      const angle = (i * 2 * Math.PI) / rays;
      ctx.fillStyle = (i % 2 === 0) ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255, 115, 0, 0.08)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, w * 0.85, angle, angle + Math.PI / rays);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 2. Descending golden lotus petals shower
    if (AppState.videoPetals) {
      AppState.videoPetals.forEach(pt => {
        pt.y += pt.vy;
        pt.x += Math.sin(time * 2 + pt.rot) * 1.2;
        pt.rot += pt.vRot;
        if (pt.y > h) { pt.y = -20; pt.x = Math.random() * w; }

        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.rot);
        ctx.fillStyle = 'rgba(245, 207, 98, 0.55)';
        ctx.beginPath();
        ctx.ellipse(0, 0, pt.size, pt.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    // 3. Top Triumphant Banner
    ctx.font = 'bold 22px "Philosopher", serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff9100';
    ctx.fillText("🌟 उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत 🌟", w / 2, 60);

    ctx.font = '15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('Arise, Awake, and Stop Not Till The Goal is Reached!', w / 2, 90);

    // 4. Monumental Sanskrit Slogan in Center with 3D drop shadow
    ctx.font = 'bold 42px "Rozha One", serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f5cf62';
    ctx.shadowColor = 'rgba(212, 175, 55, 0.9)';
    ctx.shadowBlur = 30;
    ctx.fillText(guidance?.slogan || "उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत।", w / 2, h * 0.35);
    ctx.shadowBlur = 0;

    // 5. Slogan Translation below
    ctx.font = 'bold 24px "Philosopher", serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`"${guidance?.slogan_translation || 'Strength is life, weakness is death!'}"`, w / 2, h * 0.44);

    // 6. Life Lesson Card
    if (guidance?.story?.lesson) {
      ctx.font = 'italic 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#f5cf62';
      ctx.fillText(`💡 ${guidance.story.lesson}`, w / 2, h * 0.52);
    }
  }

  // --- LOWER THIRD SUBTITLE BANNER (Crisp & Glassmorphic) ---
  const activeSub = (subtitles && subtitles[activeScene - 1]) || subtitles[0] || (guidance?.slogan_translation) || "Stand firm like a lion staring into difficulties!";
  ctx.save();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(6, 12, 24, 0.88)';
  const subWidth = Math.min(w * 0.9, ctx.measureText(activeSub).width + 120);
  ctx.roundRect(w / 2 - subWidth / 2, h - 145, subWidth, 68, [16]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Voice wave indicator in subtitle banner
  if (AppState.isAudioPlaying && !AppState.isSwamiVoiceMuted) {
    const waveX = w / 2 - subWidth / 2 + 25;
    for (let k = 0; k < 5; k++) {
      const bh = Math.sin(time * 8 + k) * 9 + 12;
      ctx.fillStyle = '#f5cf62';
      ctx.fillRect(waveX + k * 6, h - 110 - bh / 2, 3, bh);
    }
  }

  ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 10;
  ctx.fillText(activeSub, w / 2 + 10, h - 102);
  ctx.restore();
}

function updateVideoProgressUI() {
  const current = AppState.videoCurrentTime;
  const total = AppState.videoTotalDuration || 36;
  const fill = document.getElementById('videoProgressFill');
  const timeTag = document.getElementById('videoTimeTag');
  const timerLabel = document.getElementById('audioTimerDisplay');

  const ratio = Math.max(0, Math.min(1, current / total));
  if (fill) fill.style.width = `${ratio * 100}%`;

  const curMin = Math.floor(current / 60);
  const curSec = Math.floor(current % 60);
  const totMin = Math.floor(total / 60);
  const totSec = Math.floor(total % 60);
  const formattedCur = `${curMin}:${curSec < 10 ? '0' : ''}${curSec}`;
  const formattedTot = `${totMin}:${totSec < 10 ? '0' : ''}${totSec}`;

  if (timeTag) {
    timeTag.innerText = `${formattedCur} / ${formattedTot}`;
  }
  if (timerLabel) {
    timerLabel.innerText = `${curMin < 10 ? '0' : ''}${curMin}:${curSec < 10 ? '0' : ''}${curSec} / ${totMin < 10 ? '0' : ''}${totMin}:${totSec < 10 ? '0' : ''}${totSec}`;
  }

  // Update active scene chip
  const curScene = AppState.currentScene || 1;
  for (let s = 1; s <= 4; s++) {
    const btn = document.getElementById(`sceneChip${s}`);
    if (btn) {
      if (s === curScene) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  }
}

function seekVideoProgress(event) {
  const bar = document.getElementById('videoProgressTrack');
  if (!bar) return;
  if (!AppState.videoTimeline) initVideoTimeline(AppState.currentGuidance);

  const rect = bar.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
  const targetTime = ratio * AppState.videoTotalDuration;

  let targetScene = 1;
  const starts = AppState.videoTimeline?.starts || [0, 8, 16, 24];
  for (let s = starts.length - 1; s >= 0; s--) {
    if (targetTime >= starts[s]) {
      targetScene = s + 1;
      break;
    }
  }

  jumpToVideoScene(targetScene, targetTime);
}

function restartVideoAnimation() {
  clearTimeout(AppState.scenePauseTimer);
  if (AppState.activeSpeechUtterance) {
    AppState.activeSpeechUtterance.onend = null;
    AppState.activeSpeechUtterance.onerror = null;
    AppState.activeSpeechUtterance = null;
  }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  AppState.videoCurrentTime = 0;
  AppState.currentScene = 1;
  AppState.lastSpokenScene = -1;
  startVideoAnimation(AppState.currentGuidance || getDefaultInitialGuidance());
}

function toggleVideoFullscreen() {
  const container = document.querySelector('.video-player-container');
  if (!container) return;
  if (!document.fullscreenElement) {
    container.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

// Video API Settings Modal
function openVideoSettingsModal() {
  document.getElementById('videoSettingsModalOverlay')?.classList.add('open');
}

function closeVideoSettingsModal() {
  document.getElementById('videoSettingsModalOverlay')?.classList.remove('open');
}

function saveVideoApiSettings() {
  const provider = document.getElementById('videoProviderSelect')?.value;
  closeVideoSettingsModal();
  showToast(`⚙️ Video engine configured: ${provider.toUpperCase()}`);
}


// 7. YOUTH SANGAM (COMMUNITY FEED WITH UNIQUE ACCOUNTS)
// ==========================================
// Helper to find post across user posts and language presets
function findCommunityPost(postId) {
  const lang = AppState.currentLang || 'hinglish';
  const basePosts = CommunityPostsByLang[lang] || CommunityPostsByLang.hinglish;
  return (AppState.userCommunityPosts || []).find(p => p.id === postId) || basePosts.find(p => p.id === postId);
}

function escapeForAttr(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '&quot;')
    .replace(/\n/g, ' ');
}

function renderCommunityFeed(filterCategory = 'all') {
  const feed = document.getElementById('communityPostsFeed');
  if (!feed) return;

  AppState.blockedUsersSet = AppState.blockedUsersSet || new Set(['dirty_commenter_banned']);
  AppState.reportedContentSet = AppState.reportedContentSet || new Set();

  const lang = AppState.currentLang || 'hinglish';
  const basePosts = CommunityPostsByLang[lang] || CommunityPostsByLang.hinglish;
  const allPosts = [...(AppState.userCommunityPosts || []), ...basePosts];

  // Exclude posts from blocked defaulters or reported/hidden posts
  const cleanPosts = allPosts.filter(p => {
    const isAuthorBlocked = p.username && AppState.blockedUsersSet.has(p.username.toLowerCase());
    const isReported = AppState.reportedContentSet.has(p.id);
    return !isAuthorBlocked && !isReported;
  });

  const filtered = filterCategory === 'all' 
    ? cleanPosts 
    : filterCategory === 'unanswered'
      ? cleanPosts.filter(p => (p.solutions || []).length <= 1)
      : cleanPosts.filter(p => p.category === filterCategory);

  feed.innerHTML = '';

  const uiStrings = {
    english: {
      botTitle: "Vivek Saarthi Bot (Story Reflection)",
      peerSol: "Peer Solutions",
      upvoteKarma: "+10 Karma per Upvote given to Helper",
      upvoteBtn: "▲ Upvote",
      replyPlace: "Write your solution to earn +15 Karma...",
      helpBtn: "Help (+15 ⚡)"
    },
    hindi: {
      botTitle: "विवेक साथी बॉट (कथा चिंतन)",
      peerSol: "साधक समाधान",
      upvoteKarma: "सहायक को समर्थन पर +10 कर्म अंक",
      upvoteBtn: "▲ समर्थन",
      replyPlace: "अपना समाधान लिखकर +15 कर्म अंक अर्जित करें...",
      helpBtn: "सहायता (+15 ⚡)"
    },
    hinglish: {
      botTitle: "Vivek साथी Bot (Story Reflection)",
      peerSol: "Peer Solutions",
      upvoteKarma: "+10 Karma per Upvote given to Helper",
      upvoteBtn: "▲ Upvote",
      replyPlace: "Apna solution likhein aur +15 Karma kamayein...",
      helpBtn: "Help (+15 ⚡)"
    }
  };
  const u = uiStrings[lang] || uiStrings.hinglish;
  const isBlockedUser = isCurrentUserBlocked();

  if (filtered.length === 0) {
    feed.innerHTML = `
      <div style="background: rgba(255,255,255,0.02); border: 1px dashed var(--border-gold); border-radius: var(--radius-lg); padding: 2.5rem; text-align: center; color: var(--text-dim);">
        <span style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">✨</span>
        <p style="font-size: 0.95rem; color: #fff;">No dilemmas found in this category.</p>
        <p style="font-size: 0.8rem; margin-top: 0.25rem;">Be the first to share or switch filters!</p>
      </div>
    `;
    return;
  }

  filtered.forEach(post => {
    const postEl = document.createElement('div');
    postEl.className = 'post-card';

    const handleDisplay = post.isAnonymous ? '@anonymous' : `@${post.username || 'user'}`;
    const avatarDisplay = post.isAnonymous ? '?' : (post.avatar || '🧘‍♂️');

    // Filter out solutions from blocked defaulters or reported solutions
    const cleanSolutions = (post.solutions || []).filter(sol => {
      const isSolAuthorBlocked = sol.username && AppState.blockedUsersSet.has(sol.username.toLowerCase());
      const isSolReported = AppState.reportedContentSet.has(sol.id);
      return !isSolAuthorBlocked && !isSolReported;
    });

    postEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; flex-wrap: wrap; gap: 0.5rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #132a52, #d4af37); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: #fff; border: 1px solid var(--border-gold);">
            ${avatarDisplay}
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 0.45rem;">
              <strong style="color: #fff; font-size: 0.95rem;">${escapeHtml(post.author)}</strong>
              <span style="color: var(--gold-light); font-size: 0.76rem; background: rgba(212,175,55,0.12); padding: 0.1rem 0.45rem; border-radius: 4px;">${handleDisplay}</span>
            </div>
            <p style="font-size: 0.74rem; color: var(--text-dim); margin-top: 2px;">${post.timestamp}</p>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="background: rgba(212,175,55,0.15); border: 1px solid var(--border-gold); color: var(--gold-light); font-size: 0.72rem; padding: 0.2rem 0.55rem; border-radius: var(--radius-full);">
            ${post.categoryLabel}
          </span>
          <button class="report-flag-btn" onclick="openReportModal('post', '${post.id}', '${post.username || 'user'}', '${escapeForAttr(post.problemText || '')}')" title="Report dirty comments or defaulter">
            🚩 Report
          </button>
        </div>
      </div>

      <p style="font-size: 0.95rem; color: #e2e8f0; line-height: 1.6; margin-bottom: 1.25rem;">${escapeHtml(post.problemText)}</p>

      <div class="ai-intervention-bubble">
        <div style="display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.5rem;">
          <img src="assets/logo.jpg" alt="Vivek साथी" style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--gold-primary);">
          <strong style="font-size: 0.85rem; color: var(--gold-light);">${u.botTitle}</strong>
        </div>
        <p style="font-size: 0.9rem; color: #fef3c7; font-style: italic;">"${post.aiIntervention}"</p>
      </div>

      <!-- Solutions with Unique Handles & Moderation Buttons -->
      <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
          <span style="font-size: 0.82rem; color: var(--text-muted); font-weight: 600;">💬 ${cleanSolutions.length} ${u.peerSol}</span>
          <span style="font-size: 0.74rem; color: var(--emerald-glow);">${u.upvoteKarma}</span>
        </div>

        <div id="solutions_${post.id}">
          ${cleanSolutions.map(sol => `
            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 0.85rem 1rem; margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center; gap: 0.75rem;">
              <div style="flex: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--gold-light); display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                  <span>${escapeHtml(sol.author)}</span>
                  <span style="color: var(--text-dim); font-weight: normal;">@${sol.username || 'helper'}</span>
                  <span style="color: var(--emerald-glow); font-size: 0.7rem;">(${sol.badge})</span>
                </div>
                <div style="font-size: 0.88rem; color: #e2e8f0; margin-top: 3px;">${escapeHtml(sol.text)}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <button class="report-flag-btn" onclick="openReportModal('solution', '${sol.id}', '${sol.username || 'helper'}', '${escapeForAttr(sol.text || '')}')" title="Report abusive comment / defaulter">
                  🚩 Report
                </button>
                <button onclick="upvoteCommunitySolution('${post.id}', '${sol.id}')" style="background: ${sol.isUpvoted ? 'var(--emerald-karma)' : 'rgba(16,185,129,0.1)'}; border: 1px solid var(--emerald-glow); color: ${sol.isUpvoted ? '#fff' : 'var(--emerald-glow)'}; padding: 0.4rem 0.75rem; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 0.75rem; white-space: nowrap;">
                  ${u.upvoteBtn} (${sol.upvotes})
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Solution Input: Enabled for Active Users, Disabled for Blocked Defaulters -->
        ${isBlockedUser ? `
          <div style="display: flex; gap: 0.6rem; margin-top: 0.85rem; opacity: 0.6;">
            <input type="text" placeholder="🔒 Replying disabled: Account suspended as a Defaulter." disabled style="flex: 1; background: rgba(7, 15, 30, 0.5); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-full); padding: 0.5rem 1rem; color: #94a3b8; font-size: 0.85rem; cursor: not-allowed;">
            <button disabled style="background: rgba(220, 38, 38, 0.2); border: 1px solid #ef4444; color: #fca5a5; font-weight: 700; padding: 0.5rem 1.1rem; border-radius: var(--radius-full); cursor: not-allowed; font-size: 0.82rem;">
              🔒 Blocked
            </button>
          </div>
        ` : `
          <div style="display: flex; gap: 0.6rem; margin-top: 0.85rem;">
            <input type="text" id="replyInput_${post.id}" placeholder="${u.replyPlace}" style="flex: 1; background: rgba(7, 15, 30, 0.9); border: 1px solid var(--border-gold); border-radius: var(--radius-full); padding: 0.5rem 1rem; color: #fff; font-size: 0.85rem;" onkeydown="if(event.key === 'Enter') submitCommunitySolution('${post.id}')">
            <button onclick="submitCommunitySolution('${post.id}')" style="background: var(--gold-primary); border: none; color: #070f1e; font-weight: 700; padding: 0.5rem 1.1rem; border-radius: var(--radius-full); cursor: pointer; font-size: 0.82rem;">
              ${u.helpBtn}
            </button>
          </div>
        `}
      </div>
    `;
    feed.appendChild(postEl);
  });
}

function filterCommunityFeed(cat, btn) {
  document.querySelectorAll('.comm-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderCommunityFeed(cat);
}

async function publishCommunityPost() {
  const text = (document.getElementById('newCommunityPostText')?.value || '').trim();
  const isAnon = document.getElementById('postAnonymousCheck')?.checked;
  const lang = AppState.currentLang || 'hinglish';

  if (!text) {
    const errorMsgs = {
      english: '⚠️ Please enter your dilemma before posting!',
      hindi: '⚠️ कृपया पोस्ट करने से पूर्व अपनी दुविधा लिखें!',
      hinglish: '⚠️ Kripya post me kuch likhein!'
    };
    showToast(errorMsgs[lang] || errorMsgs.hinglish, 'error');
    return;
  }

  // 1. Defaulter Check
  if (isCurrentUserBlocked()) {
    showToast('🚫 Posting blocked: Your account has been suspended from Youth Sangam as a Defaulter.', 'error');
    return;
  }

  const user = AppState.currentUser;
  const defaultAuthors = {
    english: isAnon ? 'Anonymous Seeker' : (user?.name || 'Seeker'),
    hindi: isAnon ? 'गुमनाम साधक' : (user?.name || 'साधक'),
    hinglish: isAnon ? 'Anonymous Seeker' : (user?.name || 'Seeker')
  };
  const authorName = defaultAuthors[lang] || defaultAuthors.hinglish;
  const username = isAnon ? 'anonymous' : (user?.username || 'seeker');
  const avatar = isAnon ? '🪷' : (user?.avatar || '🧘‍♂️');

  // 2. Client-Side Dirty Content Shield
  const dirtyCheck = checkDirtyCommentClient(text);
  if (dirtyCheck.isDirty) {
    showToast("⚠️ DIRTY CONTENT BLOCKED: Vulgar or abusive words are strictly prohibited. Swami Vivekananda: 'Purity in speech is essential.'", 'error');
    try {
      fetch('/api/community/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          username: username,
          problem_text: text,
          category: 'fear'
        })
      }).then(r => r.json()).then(res => {
        if (res.status === 'blocked') {
          if (AppState.currentUser) {
            AppState.currentUser.is_blocked = 1;
            AppState.currentUser.is_defaulter = 1;
            AppState.currentUser.block_reason = 'Dirty Comments & Vulgar Language';
            localStorage.setItem('vivek_user', JSON.stringify(AppState.currentUser));
          }
          localStorage.setItem(`vivek_blocked_${username}`, '1');
          updateUserUI();
          renderCommunityFeed();
        }
      });
    } catch (e) {}
    return;
  }

  const newPost = {
    id: `post_${Date.now()}`,
    author: authorName,
    username: username,
    avatar: avatar,
    isAnonymous: !!isAnon,
    timestamp: lang === 'hindi' ? 'अभी-अभी' : 'Just now',
    category: 'fear',
    categoryLabel: lang === 'hindi' ? '🌟 नई दुविधा' : (lang === 'english' ? '🌟 New Dilemma' : '🌟 New Dilemma'),
    problemText: text,
    aiIntervention: lang === 'hindi' 
      ? "उत्तिष्ठत जाग्रत! 'ब्रह्मांड की समस्त शक्ति तुम्हारे भीतर है, स्वयं पर विश्वास रखो।'"
      : (lang === 'english'
        ? "Arise, awake! 'All the power in this universe is already within you; have faith in yourself.'"
        : "उत्तिष्ठत जाग्रत! 'Brahmand ki samast shakti aapke andar hai, vishwas rakhein.'"),
    solutions: []
  };

  AppState.userCommunityPosts.unshift(newPost);
  document.getElementById('newCommunityPostText').value = '';
  renderCommunityFeed('all');

  const karmaMsg = lang === 'hindi' ? 'युवा संगम में दुविधा साझा करना' : 'Sharing Dilemma in Youth Sangam';
  addKarma(5, karmaMsg);

  const toastSuccess = {
    english: '🚀 Dilemma published in Youth Sangam with your unique ID!',
    hindi: '🚀 आपकी अद्वितीय पहचान के साथ युवा संगम में पोस्ट प्रकाशित हुई!',
    hinglish: '🚀 Post published with your unique identity in Youth Sangam!'
  };
  showToast(toastSuccess[lang] || toastSuccess.hinglish);

  // Sync to backend
  try {
    const res = await fetch('/api/community/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user?.id,
        author_name: authorName,
        username: username,
        avatar: avatar,
        is_anonymous: isAnon,
        problem_text: text,
        category: 'fear'
      })
    });
    const resData = await res.json();
    if (res.status === 403 || resData.status === 'blocked') {
      if (AppState.currentUser) {
        AppState.currentUser.is_blocked = 1;
        AppState.currentUser.is_defaulter = 1;
        AppState.currentUser.block_reason = resData.message || 'Defaulter';
        localStorage.setItem('vivek_user', JSON.stringify(AppState.currentUser));
      }
      localStorage.setItem(`vivek_blocked_${username}`, '1');
      updateUserUI();
      renderCommunityFeed();
    }
  } catch (e) {}
}

async function submitCommunitySolution(postId) {
  const input = document.getElementById(`replyInput_${postId}`);
  const text = (input?.value || '').trim();
  const lang = AppState.currentLang || 'hinglish';

  if (!text) {
    const errorMsgs = {
      english: '⚠️ Please write a helpful solution!',
      hindi: '⚠️ कृपया अपना समाधान लिखें!',
      hinglish: '⚠️ Solution likhein!'
    };
    showToast(errorMsgs[lang] || errorMsgs.hinglish, 'error');
    return;
  }

  // 1. Defaulter Check
  if (isCurrentUserBlocked()) {
    showToast('🚫 Solution submission blocked: Your account is suspended as a Defaulter.', 'error');
    return;
  }

  const post = findCommunityPost(postId);
  if (!post) return;

  const user = AppState.currentUser;
  const defaultHelpers = {
    english: user?.name || 'Helper Seeker',
    hindi: user?.name || 'सहायक साधक',
    hinglish: user?.name || 'Helper Seeker'
  };
  const authorName = defaultHelpers[lang] || defaultHelpers.hinglish;
  const username = user?.username || 'helper';
  const badgeLabel = lang === 'hindi' ? '🌟 सक्रिय साथी' : '🌟 Active Saarthi';

  // 2. Client-Side Dirty Comment Shield
  const dirtyCheck = checkDirtyCommentClient(text);
  if (dirtyCheck.isDirty) {
    showToast("⚠️ DIRTY COMMENT BLOCKED: Inappropriate or vulgar words are strictly prohibited. Guard your speech!", 'error');
    try {
      fetch('/api/community/solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          user_id: user?.id,
          username: username,
          solution_text: text
        })
      }).then(r => r.json()).then(res => {
        if (res.status === 'blocked') {
          if (AppState.currentUser) {
            AppState.currentUser.is_blocked = 1;
            AppState.currentUser.is_defaulter = 1;
            AppState.currentUser.block_reason = 'Dirty Comments & Vulgar Language';
            localStorage.setItem('vivek_user', JSON.stringify(AppState.currentUser));
          }
          localStorage.setItem(`vivek_blocked_${username}`, '1');
          updateUserUI();
          renderCommunityFeed();
        }
      });
    } catch (e) {}
    return;
  }

  post.solutions.push({
    id: `s_${Date.now()}`,
    author: authorName,
    username: username,
    badge: badgeLabel,
    text: text,
    upvotes: 1,
    isUpvoted: true
  });

  input.value = '';
  renderCommunityFeed();

  const karmaReason = lang === 'hindi' ? 'साथी की सहायता करना' : 'Helping a Peer in Need';
  addKarma(15, karmaReason);

  const toastSol = {
    english: `✨ Wonderful! Solution posted as @${username} (+15 Karma)!`,
    hindi: `✨ उत्तम! @${username} द्वारा समाधान प्रकाशित (+15 कर्म अंक)!`,
    hinglish: `✨ Shandar! Solution posted as @${username} (+15 Karma)!`
  };
  showToast(toastSol[lang] || toastSol.hinglish);

  // Sync to backend
  try {
    const res = await fetch('/api/community/solution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        post_id: postId,
        user_id: user?.id,
        author_name: authorName,
        username: username,
        solution_text: text
      })
    });
    const resData = await res.json();
    if (res.status === 403 || resData.status === 'blocked') {
      if (AppState.currentUser) {
        AppState.currentUser.is_blocked = 1;
        AppState.currentUser.is_defaulter = 1;
        AppState.currentUser.block_reason = resData.message || 'Defaulter';
        localStorage.setItem('vivek_user', JSON.stringify(AppState.currentUser));
      }
      localStorage.setItem(`vivek_blocked_${username}`, '1');
      updateUserUI();
      renderCommunityFeed();
    }
  } catch (e) {}
}

// ==========================================
// REPORT & COMMUNITY MODERATION HANDLERS
// ==========================================
function openReportModal(targetType, targetId, authorUsername, snippet) {
  const targetTypeEl = document.getElementById('reportTargetType');
  const targetIdEl = document.getElementById('reportTargetId');
  const authorUserEl = document.getElementById('reportAuthorUsername');
  const authorLabelEl = document.getElementById('reportTargetAuthorLabel');
  const snippetEl = document.getElementById('reportTargetSnippet');
  const detailsEl = document.getElementById('reportDetailsInput');

  if (targetTypeEl) targetTypeEl.value = targetType;
  if (targetIdEl) targetIdEl.value = targetId;
  if (authorUserEl) authorUserEl.value = authorUsername;
  if (authorLabelEl) authorLabelEl.innerText = `@${authorUsername || 'user'}`;
  if (snippetEl) snippetEl.innerText = `"${snippet ? snippet.substring(0, 120) : '...'}"`;
  if (detailsEl) detailsEl.value = '';

  document.getElementById('reportModalOverlay')?.classList.add('open');
}

function closeReportModal() {
  document.getElementById('reportModalOverlay')?.classList.remove('open');
}

async function submitContentReport() {
  const targetType = document.getElementById('reportTargetType')?.value || 'post';
  const targetId = document.getElementById('reportTargetId')?.value;
  const authorUsername = document.getElementById('reportAuthorUsername')?.value || '';
  const reasonEl = document.querySelector('input[name="reportReasonChoice"]:checked');
  const reason = reasonEl ? reasonEl.value : 'dirty_language';
  const details = (document.getElementById('reportDetailsInput')?.value || '').trim();

  if (!targetId) return;

  const user = AppState.currentUser;
  const reporterHandle = user?.username || 'anonymous_peer';

  // Instant local quarantine
  AppState.reportedContentSet = AppState.reportedContentSet || new Set();
  AppState.reportedContentSet.add(targetId);

  // If reported for dirty language or defaulter, hide locally immediately
  if (targetType === 'post') {
    AppState.userCommunityPosts = (AppState.userCommunityPosts || []).filter(p => p.id !== targetId);
  } else {
    const lang = AppState.currentLang || 'hinglish';
    const basePosts = CommunityPostsByLang[lang] || CommunityPostsByLang.hinglish;
    [...(AppState.userCommunityPosts || []), ...basePosts].forEach(p => {
      if (p.solutions) {
        p.solutions = p.solutions.filter(s => s.id !== targetId);
      }
    });
  }

  closeReportModal();
  renderCommunityFeed();
  showToast('🚩 Content reported and quarantined from your feed. Dharma Rakshak notified!');

  try {
    await fetch('/api/community/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_type: targetType,
        target_id: targetId,
        reporter_id: user?.id,
        reporter_handle: reporterHandle,
        author_username: authorUsername,
        reason: reason,
        details: details
      })
    });
  } catch (e) {}
}

// ==========================================
// SANGAM GUARDIAN & DEFAULTERS DASHBOARD
// ==========================================
function openGuardianModal() {
  document.getElementById('guardianModalOverlay')?.classList.add('open');
  loadGuardianData();
}

function closeGuardianModal() {
  document.getElementById('guardianModalOverlay')?.classList.remove('open');
}

function switchGuardianTab(tab) {
  const tabDef = document.getElementById('guardianTabDefaulters');
  const tabRep = document.getElementById('guardianTabReports');
  const btnDef = document.getElementById('guardianTabBtnDefaulters');
  const btnRep = document.getElementById('guardianTabBtnReports');

  if (!tabDef || !tabRep) return;

  if (tab === 'defaulters') {
    tabDef.style.display = 'block';
    tabRep.style.display = 'none';
    btnDef?.classList.add('active');
    btnRep?.classList.remove('active');
  } else {
    tabDef.style.display = 'none';
    tabRep.style.display = 'block';
    btnDef?.classList.remove('active');
    btnRep?.classList.add('active');
  }
}

async function loadGuardianData() {
  try {
    const res = await fetch('/api/community/moderation');
    if (!res.ok) throw new Error('Failed to load moderation data');
    const data = await res.json();

    // Update stats
    const totalEl = document.getElementById('statTotalBlocked');
    const dirtyEl = document.getElementById('statDirtyStopped');
    const purityEl = document.getElementById('statPurityScore');
    const countBadge = document.getElementById('guardianBlockedCountBadge');
    const repBadge = document.getElementById('guardianReportsCountBadge');

    if (totalEl) totalEl.innerText = data.stats?.total_blocked_defaulters || '0';
    if (dirtyEl) dirtyEl.innerText = data.stats?.dirty_comments_filtered || '0';
    if (purityEl) purityEl.innerText = data.stats?.community_purity_score || '99.8%';
    if (countBadge) countBadge.innerText = (data.blocked_users || []).length;
    if (repBadge) repBadge.innerText = (data.reports || []).length;

    // Cache blocked users in AppState
    AppState.blockedUsersSet = new Set((data.blocked_users || []).map(u => (u.username || '').toLowerCase()));

    // Render Defaulters List
    const defListEl = document.getElementById('guardianDefaultersList');
    if (defListEl) {
      if (!data.blocked_users || data.blocked_users.length === 0) {
        defListEl.innerHTML = `<div style="text-align: center; color: var(--emerald-glow); padding: 2rem 0;">✨ All clean! No defaulters currently recorded.</div>`;
      } else {
        defListEl.innerHTML = data.blocked_users.map(u => {
          const isCurrentlyBlocked = u.is_blocked || u.is_defaulter;
          return `
            <div class="guardian-row-card">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(220,38,38,0.2); border: 1px solid #ef4444; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                  ${u.avatar || '🚫'}
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                    <strong style="color: #fff; font-size: 0.92rem;">${escapeHtml(u.name || 'User')}</strong>
                    <span style="color: #fca5a5; font-size: 0.78rem;">@${u.username}</span>
                    <span class="defaulter-pill">${isCurrentlyBlocked ? '🚫 BLOCKED DEFAULTER' : '⚠️ WARNED'}</span>
                  </div>
                  <div style="font-size: 0.76rem; color: #cbd5e1; margin-top: 3px;">
                    ${escapeHtml(u.block_reason || 'Community Guideline Violations')} · <span style="color: #fbbf24;">Strikes: ${u.strikes || 0}</span>
                  </div>
                </div>
              </div>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                ${isCurrentlyBlocked ? `
                  <button class="guardian-btn-action guardian-btn-unblock" onclick="guardianUnblockUser('${u.username}')">
                    🔓 Unblock / Pardon
                  </button>
                ` : `
                  <button class="guardian-btn-action guardian-btn-ban" onclick="guardianBlockUser('${u.username}', 'Manually Blocked by Guardian')">
                    🚫 Block Defaulter
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Render Reports List
    const repListEl = document.getElementById('guardianReportsList');
    if (repListEl) {
      if (!data.reports || data.reports.length === 0) {
        repListEl.innerHTML = `<div style="text-align: center; color: var(--emerald-glow); padding: 2rem 0;">✨ No pending reports in queue. Community is harmonious.</div>`;
      } else {
        repListEl.innerHTML = data.reports.map(r => `
          <div class="guardian-row-card">
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; flex-wrap: wrap;">
                <span style="background: rgba(239,68,68,0.2); border: 1px solid #ef4444; color: #fca5a5; font-size: 0.68rem; font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 4px;">
                  ${r.target_type.toUpperCase()}
                </span>
                <strong style="color: var(--gold-light); font-size: 0.85rem;">Author: @${r.author_username || 'unknown'}</strong>
                <span style="font-size: 0.74rem; color: var(--text-dim);">Reported by @${r.reporter_handle || 'anonymous'}</span>
              </div>
              <div style="font-size: 0.82rem; color: #fee2e2; font-style: italic; background: rgba(0,0,0,0.3); padding: 0.4rem 0.6rem; border-radius: 4px; margin: 0.35rem 0;">
                "${escapeHtml(r.content_snippet || '...')}"
              </div>
              <div style="font-size: 0.74rem; color: #fbbf24;">
                Reason: <strong>${escapeHtml(r.reason)}</strong> ${r.details ? `(${escapeHtml(r.details)})` : ''}
              </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.4rem; align-items: flex-end;">
              <button class="guardian-btn-action guardian-btn-ban" onclick="guardianPurgeReport('${r.id}', '${r.target_type}', '${r.target_id}', true)">
                🗑️ Purge &amp; Ban Author
              </button>
              <button class="secondary-pill-btn" onclick="guardianPurgeReport('${r.id}', '${r.target_type}', '${r.target_id}', false)" style="font-size: 0.72rem; padding: 0.3rem 0.65rem; border-radius: 4px;">
                ✅ Dismiss Report
              </button>
            </div>
          </div>
        `).join('');
      }
    }

  } catch (err) {
    console.error('Failed to load guardian data', err);
  }
}

async function guardianSubmitManualBlock() {
  const handleInput = document.getElementById('guardianBlockHandleInput');
  const reasonSelect = document.getElementById('guardianBlockReasonSelect');
  const handle = (handleInput?.value || '').trim().replace(/^@/, '');
  const reason = reasonSelect?.value || 'Violating Youth Sangam Standards';

  if (!handle) {
    showToast('⚠️ Please enter the @username to block', 'error');
    return;
  }

  await guardianBlockUser(handle, reason);
  if (handleInput) handleInput.value = '';
}

async function guardianBlockUser(username, reason) {
  try {
    const res = await fetch('/api/community/block-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, action: 'block', reason })
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`🚫 @${username} BLOCKED from Youth Sangam as a Defaulter.`);
      AppState.blockedUsersSet = AppState.blockedUsersSet || new Set();
      AppState.blockedUsersSet.add(username.toLowerCase());
      localStorage.setItem(`vivek_blocked_${username}`, '1');

      if (AppState.currentUser && AppState.currentUser.username.toLowerCase() === username.toLowerCase()) {
        AppState.currentUser.is_blocked = 1;
        AppState.currentUser.is_defaulter = 1;
        AppState.currentUser.block_reason = reason;
        localStorage.setItem('vivek_user', JSON.stringify(AppState.currentUser));
        updateUserUI();
      }

      loadGuardianData();
      renderCommunityFeed();
    } else {
      showToast(data.message || 'Error blocking user', 'error');
    }
  } catch (e) {
    showToast('Failed to connect to server', 'error');
  }
}

async function guardianUnblockUser(username) {
  try {
    const res = await fetch('/api/community/block-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, action: 'unblock' })
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`🔓 @${username} unblocked. Community privileges restored.`);
      if (AppState.blockedUsersSet) {
        AppState.blockedUsersSet.delete(username.toLowerCase());
      }
      localStorage.removeItem(`vivek_blocked_${username}`);

      if (AppState.currentUser && AppState.currentUser.username.toLowerCase() === username.toLowerCase()) {
        AppState.currentUser.is_blocked = 0;
        AppState.currentUser.is_defaulter = 0;
        AppState.currentUser.block_reason = '';
        localStorage.setItem('vivek_user', JSON.stringify(AppState.currentUser));
        updateUserUI();
      }

      loadGuardianData();
      renderCommunityFeed();
    } else {
      showToast(data.message || 'Error unblocking user', 'error');
    }
  } catch (e) {
    showToast('Failed to connect to server', 'error');
  }
}

async function guardianPurgeReport(reportId, targetType, targetId, banAuthor) {
  try {
    const res = await fetch('/api/community/delete-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_id: reportId, target_type: targetType, target_id: targetId, ban_author: banAuthor })
    });
    if (res.ok) {
      showToast(banAuthor ? '🗑️ Offending content purged and author banned!' : '✅ Report resolved.');
      loadGuardianData();
      renderCommunityFeed();
    }
  } catch (e) {}
}

function upvoteCommunitySolution(postId, solId) {
  const post = findCommunityPost(postId);
  if (!post) return;
  const sol = post.solutions.find(s => s.id === solId);
  if (!sol) return;
  const lang = AppState.currentLang || 'hinglish';

  if (sol.isUpvoted) {
    sol.upvotes -= 1;
    sol.isUpvoted = false;
    showToast(lang === 'hindi' ? 'समर्थन वापस लिया गया' : 'Upvote removed');
  } else {
    sol.upvotes += 1;
    sol.isUpvoted = true;
    addKarma(10, lang === 'hindi' ? 'उत्तम समाधान का समर्थन' : "Upvoting Peer's Good Solution");
    const upMsg = {
      english: `👍 Upvoted @${sol.username}! Helper received +10 Karma!`,
      hindi: `👍 @${sol.username} को समर्थन दिया! सहायक को +10 कर्म अंक प्राप्त हुए!`,
      hinglish: `👍 Upvoted @${sol.username}! Helper ko +10 Karma mila!`
    };
    showToast(upMsg[lang] || upMsg.hinglish);
  }
  renderCommunityFeed();
}

// ==========================================
// 8. KARMA POINTS & ECONOMY SYSTEM
// ==========================================
function addKarma(amount, reason) {
  AppState.karmaPoints = Math.max(0, AppState.karmaPoints + amount);
  localStorage.setItem('vivek_karma', AppState.karmaPoints.toString());
  if (AppState.currentUser) {
    AppState.currentUser.karma_points = AppState.karmaPoints;
    localStorage.setItem('vivek_user', JSON.stringify(AppState.currentUser));
    try {
      fetch('/api/user/karma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: AppState.currentUser.id,
          amount: amount,
          action: 'add',
          reason: reason
        })
      });
    } catch(e) {}
  }
  updateKarmaDisplay();
  showToast(`⚡ +${amount} Karma Earned! (${reason})`);
  triggerConfetti();
}

function updateKarmaDisplay() {
  const pts = Math.max(0, AppState.karmaPoints || 0);
  const hBadge = document.getElementById('headerKarmaPoints');
  const sLarge = document.getElementById('storeLargeKarmaBalance');
  const sSide = document.getElementById('sidebarUserKarma');
  const portalKarma = document.getElementById('portalStatsKarma');
  const zeroBanner = document.getElementById('zeroKarmaWarningBanner');

  if (hBadge) hBadge.innerText = `${pts} Karma`;
  if (sLarge) sLarge.innerText = pts.toString();
  if (sSide) sSide.innerText = `${pts} Karma`;
  if (portalKarma) portalKarma.innerText = pts.toString();
  if (zeroBanner) zeroBanner.style.display = pts <= 0 ? 'flex' : 'none';
}

function scrollToRedeem() {
  switchTab('store');
}

// ==========================================
// 9. CHECKOUT & PRO STORE
// ==========================================
let activePlan = { name: '', price: 0 };

function openCheckoutModal(planName, price) {
  activePlan = { name: planName, price: price };
  document.getElementById('modalSummaryPlanName').innerText = planName;
  document.getElementById('modalSummaryPrice').innerText = `₹${price}`;
  document.getElementById('confirmPaymentBtn').innerText = `Complete Payment (₹${price})`;
  document.getElementById('checkoutModalOverlay')?.classList.add('open');
}

function closeCheckoutModal() {
  document.getElementById('checkoutModalOverlay')?.classList.remove('open');
}

function processMockPayment() {
  const btn = document.getElementById('confirmPaymentBtn');
  btn.innerText = 'Activating Pass via Gateway...';
  btn.disabled = true;

  setTimeout(() => {
    btn.disabled = false;
    closeCheckoutModal();
    addKarma(500, `Pro Pass Bonus (${activePlan.name})`);
    showToast(`🎉 Success! ${activePlan.name} is now active on your account!`);
    triggerConfetti();
  }, 1200);
}

// ==========================================
// 10. AMBIENT SOUND (WEB AUDIO API)
// ==========================================
function toggleAmbientSound() {
  const btn = document.getElementById('ambientSoundBtn');
  if (AppState.isAmbientPlaying) {
    stopAmbientSound();
    btn?.classList.remove('playing');
    showToast('Ambient sound muted 🔇');
  } else {
    startAmbientSound();
    btn?.classList.add('playing');
    showToast('Gentle meditative ambient activated 🔔');
  }
}

function startAmbientSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (AppState.ambientAudioCtx) {
      stopAmbientSound();
    }
    AppState.ambientAudioCtx = new AudioCtx();
    const ctx = AppState.ambientAudioCtx;

    // Pure, soft warm sine wave at whisper-quiet volume (no harsh triangle drone)
    const freqs = [108.0, 216.0];
    AppState.ambientOscillators = freqs.map((f) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine'; // Pure sine, zero buzzing harmonic distortion
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      gain.gain.setValueAtTime(0.006, ctx.currentTime); // Whisper quiet
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      return { osc, gain };
    });
    AppState.isAmbientPlaying = true;
  } catch (err) {}
}

function stopAmbientSound() {
  if (AppState.ambientOscillators) {
    AppState.ambientOscillators.forEach(({ osc }) => {
      try { osc.stop(); } catch (e) {}
    });
    AppState.ambientOscillators = [];
  }
  if (AppState.ambientAudioCtx) {
    try { AppState.ambientAudioCtx.close(); } catch (e) {}
    AppState.ambientAudioCtx = null;
  }
  AppState.isAmbientPlaying = false;
  const btn = document.getElementById('ambientSoundBtn');
  btn?.classList.remove('playing');
}

function playHarmonicChime() {
  // Silent no-op: Annoying background tone eliminated
}

// ==========================================
// 11. SPEECH-TO-TEXT INPUT
// ==========================================
function initSpeechRecognition() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) return;

  AppState.recognition = new SpeechRec();
  AppState.recognition.continuous = false;
  AppState.recognition.interimResults = false;
  AppState.recognition.lang = AppState.currentLang === 'english' ? 'en-IN' : 'hi-IN';

  AppState.recognition.onstart = () => {
    AppState.isListening = true;
    document.getElementById('voiceInputMicBtn')?.classList.add('listening');
    showToast('🎙️ Listening... Please speak now.');
  };

  AppState.recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const input = document.getElementById('userSituationInput');
    if (input) {
      input.value = transcript;
      handleCharCount();
    }
    showToast(`Recognized: "${transcript.substring(0, 30)}..."`);
  };

  AppState.recognition.onend = () => {
    AppState.isListening = false;
    document.getElementById('voiceInputMicBtn')?.classList.remove('listening');
  };
}

function toggleSpeechRecognition() {
  if (!AppState.recognition) {
    showToast('Voice input not supported in this browser, please type below.', 'error');
    return;
  }
  if (AppState.isListening) {
    AppState.recognition.stop();
  } else {
    AppState.recognition.start();
  }
}

// ==========================================
// 12. TAB NAVIGATION & LANGUAGE
// ==========================================
function switchTab(tabId) {
  AppState.currentTab = tabId;
  document.querySelectorAll('.nav-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(panel => panel.classList.remove('active'));

  if (tabId === 'mentorship') {
    document.getElementById('tabBtnMentorship')?.classList.add('active');
    document.getElementById('tabContentMentorship')?.classList.add('active');
  } else if (tabId === 'community') {
    document.getElementById('tabBtnCommunity')?.classList.add('active');
    document.getElementById('tabContentCommunity')?.classList.add('active');
  } else if (tabId === 'store') {
    document.getElementById('tabBtnStore')?.classList.add('active');
    document.getElementById('tabContentStore')?.classList.add('active');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setLanguage(lang) {
  applyLanguage(lang, true);
}

function applyLanguage(lang, showToastNotification = true) {
  if (!lang || !Translations[lang]) {
    lang = 'hinglish';
  }
  AppState.currentLang = lang;
  localStorage.setItem('vivek_lang', lang);

  // 1. Language selector buttons toggle
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
  if (lang === 'hinglish') document.getElementById('langBtnHinglish')?.classList.add('active');
  if (lang === 'hindi') document.getElementById('langBtnHindi')?.classList.add('active');
  if (lang === 'english') document.getElementById('langBtnEnglish')?.classList.add('active');

  // 2. Translate all [data-i18n] elements
  const dict = Translations[lang] || Translations.hinglish;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict && dict[key] !== undefined) {
      el.innerHTML = dict[key];
    }
  });

  // 3. Update input & textarea placeholders
  const ph = Placeholders[lang] || Placeholders.hinglish;
  for (const [id, text] of Object.entries(ph)) {
    const inputEl = document.getElementById(id);
    if (inputEl) inputEl.placeholder = text;
  }

  // 4. Update Speech Recognition
  if (AppState.recognition) {
    AppState.recognition.lang = lang === 'english' ? 'en-US' : 'hi-IN';
  }

  // 5. Update User UI (Navbar & Portal guest tags)
  updateUserUI();
  updateThemeToggleUI();

  // 5b. Update Multi-Language HD Video Katha Player to match selected language
  if (AppState.currentVideoTheme) {
    loadVivekVaniVideo(AppState.currentVideoTheme, lang, false);
  }

  // 6. Update Community Feed with active language
  renderCommunityFeed();

  // 7. If mentorship result is active, update displayed language immediately!
  if (AppState.currentGuidance && AppState.currentGuidance.all_translations) {
    const t = AppState.currentGuidance.all_translations[lang];
    if (t) {
      const storyTitleEl = document.getElementById('resultStoryTitle');
      const storyBodyEl = document.getElementById('resultStoryBody');
      const storyLessonEl = document.getElementById('resultStoryLesson');
      const translationQuoteEl = document.getElementById('resultTranslationQuote');
      const activeSubtitleEl = document.getElementById('activeSubtitleText');

      if (storyTitleEl) storyTitleEl.innerText = t.story_title;
      if (storyBodyEl) storyBodyEl.innerText = t.story_text;
      if (storyLessonEl) storyLessonEl.innerHTML = `💡 <strong>${dict.lesson_prefix || 'Life Lesson:'}</strong> ${t.story_lesson}`;
      if (translationQuoteEl) translationQuoteEl.innerText = `"${t.slogan_trans}"`;
      if (activeSubtitleEl) activeSubtitleEl.innerText = `"${t.slogan_trans}"`;

      AppState.currentGuidance.voice_narration = t.voice_narration;
      AppState.currentGuidance.video_subtitles = t.video_subtitles;

      initVideoTimeline(AppState.currentGuidance);
      updateVideoProgressUI();

      if ('speechSynthesis' in window && (AppState.isAudioPlaying || AppState.isVideoPlaying)) {
        if (AppState.activeSpeechUtterance) {
          AppState.activeSpeechUtterance.onend = null;
          AppState.activeSpeechUtterance.onerror = null;
          AppState.activeSpeechUtterance = null;
        }
        window.speechSynthesis.cancel();
        speakSceneNarrationForVideo(AppState.currentScene || 1, AppState.currentGuidance, AppState.videoCurrentTime);
      }
    }
  }

  // 8. Show notification if requested
  if (showToastNotification) {
    const toastMsgs = {
      english: "🎙️ Language & Accent: English Orator Voice ✓",
      hindi: "🎙️ भाषा एवं उच्चारण: स्वामी जी हिंदी स्वर (Hindi Accent) ✓",
      hinglish: "🎙️ Language & Accent: Hinglish (Indian Accent) ✓"
    };
    showToast(toastMsgs[lang] || `Language set to ${lang.toUpperCase()}`);
  }
}

// ==========================================
// 12. THEME ENGINE (VEDIC SAFFRON & SWARNA LIGHT / COSMIC DARK)
// Matches Swami Vivekananda Official Logo Colors
// ==========================================
function initTheme() {
  const savedTheme = localStorage.getItem('vivek_theme') || 'dark';
  applyTheme(savedTheme, false);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || AppState.currentTheme || 'dark';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme, true);
}

function applyTheme(theme, showNotification = true) {
  if (theme !== 'light' && theme !== 'dark') {
    theme = 'dark';
  }
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('vivek_theme', theme);
  AppState.currentTheme = theme;

  updateThemeToggleUI();

  if (showNotification) {
    const lang = AppState.currentLang || 'hinglish';
    const notifs = {
      light: {
        english: "☀️ Saffron & Gold Light Theme activated (Inspired by Swami ji's Emblem)!",
        hindi: "☀️ भगवा एवं स्वर्णिम आभा (लाइट थीम) सक्रिय!",
        hinglish: "☀️ Saffron & Gold Light Theme activated (Logo Theme)!"
      },
      dark: {
        english: "🌙 Cosmic Dark Theme activated!",
        hindi: "🌙 गहरा अंतरिक्ष (डार्क थीम) सक्रिय!",
        hinglish: "🌙 Cosmic Dark Theme activated!"
      }
    };
    const msg = (notifs[theme] && notifs[theme][lang]) ? notifs[theme][lang] : notifs[theme].hinglish;
    showToast(msg, 'success');
  }
}

function updateThemeToggleUI() {
  const theme = document.documentElement.getAttribute('data-theme') || AppState.currentTheme || 'dark';
  const toggleBtn = document.getElementById('themeToggleBtn');
  const toggleIcon = document.getElementById('themeToggleIcon');
  const toggleLabel = document.getElementById('themeToggleLabel');
  const lang = AppState.currentLang || 'hinglish';

  if (!toggleBtn || !toggleIcon || !toggleLabel) return;

  if (theme === 'light') {
    toggleIcon.textContent = '🌙';
    toggleLabel.textContent = lang === 'hindi' ? 'डार्क' : 'Dark';
    toggleBtn.setAttribute('title', lang === 'hindi' ? 'डार्क थीम पर जाएं' : 'Switch to Cosmic Dark Theme');
  } else {
    toggleIcon.textContent = '☀️';
    toggleLabel.textContent = lang === 'hindi' ? 'लाइट' : 'Light';
    toggleBtn.setAttribute('title', lang === 'hindi' ? 'भगवा एवं स्वर्णिम लाइट थीम पर जाएं' : 'Switch to Saffron & Gold Light Theme');
  }
}

// ==========================================
// 13. TOAST & CONFETTI
// ==========================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${type === 'error' ? '⚠️' : '⚡'}</span> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function triggerConfetti() {
  const colors = ['#ff7300', '#d4af37', '#f5cf62', '#10b981', '#132a52'];
  for (let i = 0; i < 30; i++) {
    const piece = document.createElement('div');
    piece.style.position = 'fixed';
    piece.style.top = '10%';
    piece.style.left = `${Math.random() * 80 + 10}%`;
    piece.style.width = `${Math.random() * 8 + 6}px`;
    piece.style.height = `${Math.random() * 12 + 6}px`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.zIndex = '9999';
    piece.style.pointerEvents = 'none';
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    piece.style.transition = 'all 1.5s cubic-bezier(0.25, 1, 0.5, 1)';
    document.body.appendChild(piece);
    setTimeout(() => {
      piece.style.top = `${Math.random() * 60 + 40}%`;
      piece.style.opacity = '0';
      piece.style.transform = `translate(${Math.random() * 100 - 50}px, 200px) rotate(${Math.random() * 720}deg)`;
    }, 20);
    setTimeout(() => piece.remove(), 1600);
  }
}

function copyWisdomQuote() {
  const quote = document.getElementById('resultSanskritQuote')?.innerText;
  const trans = document.getElementById('resultTranslationQuote')?.innerText;
  const lang = AppState.currentLang || 'hinglish';
  const msgs = {
    english: '📋 Slogan & meaning copied!',
    hindi: '📋 श्लोक एवं भावार्थ कॉपी किया गया!',
    hinglish: '📋 Slogan & meaning copied!'
  };
  if (quote) {
    navigator.clipboard.writeText(`${quote} - ${trans}`);
    showToast(msgs[lang] || msgs.hinglish);
  }
}

function saveWisdomToJournal() {
  const lang = AppState.currentLang || 'hinglish';
  const msgs = {
    english: '🔖 Saved to your personal Vivek Journal! (+5 Karma)',
    hindi: '🔖 आपकी व्यक्तिगत विवेक दैनिकी में सहेजा गया! (+5 कर्म अंक)',
    hinglish: '🔖 Saved to your personal Vivek Journal! (+5 Karma)'
  };
  showToast(msgs[lang] || msgs.hinglish);
  addKarma(5, lang === 'hindi' ? 'दैनिक ज्ञान दैनिकी' : 'Daily Wisdom Journaling');
}

function shareWisdomToSangam() {
  switchTab('community');
  const quote = document.getElementById('resultSanskritQuote')?.innerText;
  const input = document.getElementById('newCommunityPostText');
  const lang = AppState.currentLang || 'hinglish';
  if (input && quote) {
    if (lang === 'english') {
      input.value = `Swami Vivekananda Ji's Mantra for today: "${quote}". Arise and banish all despair to make a fearless new beginning!`;
    } else if (lang === 'hindi') {
      input.value = `स्वामी विवेकानंद जी का आज का पावन महामंत्र: "${quote}"। समस्त निराशा व दुर्बलता त्याग कर एक तेजस्वी नई शुरुआत करें!`;
    } else {
      input.value = `Swami Vivekananda Ji's Mantra for today: "${quote}". Aaj se sabhi niraasha ko chhod kar nayi shuruaat karein!`;
    }
    input.focus();
  }
}

// ==========================================
// 10. PAST MENTORSHIP JOURNEY (PERSISTENCE, CONTINUATION & EDITING)
// ==========================================
async function fetchAndRenderPastSessions() {
  const user = AppState.currentUser;
  const listEl = document.getElementById('pastSessionsList');
  const emptyEl = document.getElementById('pastSessionsEmptyState');
  const badgeEl = document.getElementById('pastSessionsCountBadge');
  if (!listEl) return;

  let sessions = [];

  // 1. Fetch from backend if user is logged in
  if (user && user.id) {
    try {
      const res = await fetch(`/api/mentor/sessions?user_id=${user.id}`);
      const data = await res.json();
      sessions = data.sessions || [];
    } catch (err) {
      console.warn('Backend fetch failed, falling back to local storage:', err);
    }
  }

  // 2. Load and merge local guest sessions
  try {
    const localSessions = JSON.parse(localStorage.getItem('vivek_guest_sessions') || '[]');
    if (localSessions.length > 0) {
      const sessionIds = new Set(sessions.map(s => s.id));
      for (const loc of localSessions) {
        if (!sessionIds.has(loc.id)) {
          sessions.push(loc);
          sessionIds.add(loc.id);
        }
      }
    }
  } catch (e) {}

  AppState.pastMentorshipSessions = sessions;

  if (badgeEl) badgeEl.innerText = `${sessions.length} Sessions`;
  const portalCount = document.getElementById('portalStatsMentorships');
  if (portalCount) portalCount.innerText = sessions.length.toString();

  if (sessions.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    listEl.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  listEl.style.display = 'grid';

  listEl.innerHTML = sessions.map(sess => {
    const dateStr = sess.created_at ? new Date(sess.created_at).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : 'Past Session';

    return `
      <div class="past-session-card" id="session_card_${sess.id}" style="transition: all 0.3s ease;">
        <div onclick="openViewPastSession('${sess.id}')" style="cursor: pointer;">
          <div class="past-session-date">
            <span>📅</span> <span>${dateStr}</span>
            <span style="margin-left: auto; color: var(--gold-primary); font-size: 0.72rem; font-weight: 600;">👁️ Tap to View</span>
          </div>
          <div class="past-session-problem" title="${sess.problem_text}">
            "${sess.problem_text}"
          </div>
          <div class="past-session-katha">
            📖 ${sess.story_title}
          </div>
          <div class="past-session-slogan-box">
            "${sess.sanskrit_slogan} — ${sess.slogan_translation}"
          </div>
          ${sess.notes ? `
            <div class="past-session-notes-box">
              📝 <strong>Notes:</strong> ${sess.notes}
            </div>
          ` : ''}
        </div>

        <div class="past-session-actions-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 0.35rem;">
          <button class="past-action-btn past-action-view" onclick="openViewPastSession('${sess.id}')" title="Puri katha aur prerna dekhein">
            <span>👁️</span> Dekhein
          </button>
          <button class="past-action-btn past-action-continue" onclick="continuePastSession('${sess.id}')" title="Continue & ask follow-up questions">
            <span>▶️</span> Continue
          </button>
          <button class="past-action-btn past-action-share" onclick="openSharePastSession('${sess.id}')" title="Share wisdom (Sangam / WhatsApp)">
            <span>🌐</span> Share
          </button>
          <button class="past-action-btn past-action-delete" onclick="deletePastSession('${sess.id}')" title="Session delete karein">
            <span>🗑️</span> Delete
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// 1. DEKHNA: View Mentorship Session Details Modal
function openViewPastSession(sessionId) {
  const sessions = AppState.pastMentorshipSessions || [];
  const sess = sessions.find(s => s.id === sessionId);
  if (!sess) return;

  const dateStr = sess.created_at ? new Date(sess.created_at).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : 'Recorded Consultation';

  const dateTag = document.getElementById('viewSessionDateTag');
  if (dateTag) dateTag.innerText = `📅 ${dateStr}`;

  const probEl = document.getElementById('viewSessionProblemText');
  if (probEl) probEl.innerText = sess.problem_text || '';

  const titleEl = document.getElementById('viewSessionStoryTitle');
  if (titleEl) titleEl.innerText = sess.story_title || 'Swami Vivekananda Parable';

  const textEl = document.getElementById('viewSessionStoryText');
  if (textEl) textEl.innerText = sess.story_text || '';

  const lessonEl = document.getElementById('viewSessionStoryLesson');
  if (lessonEl) lessonEl.innerHTML = `💡 <strong>Life Lesson:</strong> ${sess.story_lesson || 'Stand firm like a lion!'}`;

  const sloganEl = document.getElementById('viewSessionSlogan');
  if (sloganEl) sloganEl.innerText = sess.sanskrit_slogan || "उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत।";

  const transEl = document.getElementById('viewSessionTranslation');
  if (transEl) transEl.innerText = `"${sess.slogan_translation || 'Arise, awake, and stop not till the goal is reached!'}"`;

  const notesContainer = document.getElementById('viewSessionNotesContainer');
  const notesText = document.getElementById('viewSessionNotesText');
  if (notesContainer && notesText) {
    if (sess.notes && sess.notes.trim()) {
      notesContainer.style.display = 'block';
      notesText.innerText = sess.notes;
    } else {
      notesContainer.style.display = 'none';
    }
  }

  const continueBtn = document.getElementById('viewModalContinueBtn');
  if (continueBtn) {
    continueBtn.onclick = () => {
      closeViewMentorshipModal();
      continuePastSession(sess.id);
    };
  }

  const shareBtn = document.getElementById('viewModalShareBtn');
  if (shareBtn) {
    shareBtn.onclick = () => {
      closeViewMentorshipModal();
      openSharePastSession(sess.id);
    };
  }

  const deleteBtn = document.getElementById('viewModalDeleteBtn');
  if (deleteBtn) {
    deleteBtn.onclick = () => {
      closeViewMentorshipModal();
      deletePastSession(sess.id);
    };
  }

  document.getElementById('viewMentorshipModalOverlay')?.classList.add('open');
}

function closeViewMentorshipModal() {
  document.getElementById('viewMentorshipModalOverlay')?.classList.remove('open');
}

// 2. CONTINUE KARNA: Load session directly back into active guidance & chat
function continuePastSession(sessionId) {
  const sessions = AppState.pastMentorshipSessions || [];
  const sess = sessions.find(s => s.id === sessionId);
  if (!sess) return;

  const lang = sess.lang || AppState.currentLang || 'hinglish';
  const guidanceData = {
    story_id: sess.story_id || 'story_monkeys_varanasi',
    story: {
      title: sess.story_title,
      text: sess.story_text,
      lesson: sess.story_lesson
    },
    slogan: sess.sanskrit_slogan,
    slogan_translation: sess.slogan_translation,
    video_subtitles: [
      sess.problem_text,
      sess.story_title,
      sess.story_lesson,
      sess.slogan_translation
    ],
    voice_narration: sess.voice_narration || `${sess.story_title}. ${sess.story_lesson}`,
    video_theme: sess.video_theme || 'golden_radiance',
    mindset_shift: sess.story_lesson ? `Sadhana Focus: ${sess.story_lesson}` : "Galti identify karo aur action par wapas aao.",
    action_plan: [
      { num: 1, title: "Reflect on Katha", desc: `Apply the wisdom of ${sess.story_title} to current hurdle.` },
      { num: 2, title: "Sanskrit Mahavakya Slogan", desc: `${sess.sanskrit_slogan} — ${sess.slogan_translation}` },
      { num: 3, title: "Take 1 Courageous Action", desc: "Spend 45 minutes confronting this dilemma boldly today." },
      { num: 4, title: "Track Progress", desc: "Record your thoughts and results in your spiritual journal." }
    ],
    next_24_hours: [
      { id: "chk_1", text: `Recite "${sess.sanskrit_slogan}" 3 times when fear arises`, done: false },
      { id: "chk_2", text: `Complete 1 focused step on "${sess.problem_text}"`, done: false },
      { id: "chk_3", text: "Practice 10 minutes quiet reflection before sleep", done: false }
    ],
    all_translations: {
      [lang]: {
        story_title: sess.story_title,
        story_text: sess.story_text,
        story_lesson: sess.story_lesson,
        slogan_trans: sess.slogan_translation,
        voice_narration: sess.voice_narration || `${sess.story_title}. ${sess.story_lesson}`
      }
    }
  };

  displayGuidanceResult(guidanceData);

  // Switch to Mentorship tab if not active
  switchTab('mentorship');

  // Scroll to active guidance result smoothly
  const resultCard = document.getElementById('activeGuidanceResult');
  if (resultCard) {
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Pre-fill follow-up input in Saarthi chat
  const chatInput = document.getElementById('saarthiChatInput');
  if (chatInput) {
    chatInput.value = `Regarding "${sess.story_title}": Swami ji, `;
    chatInput.focus();
  }

  const situationInput = document.getElementById('userSituationInput');
  if (situationInput) {
    situationInput.value = sess.problem_text;
    handleCharCount();
  }

  showToast(`📖 Loaded session: "${sess.story_title}". Continuing guidance 🙏`);
}

// 3. DELETE KARNA: Remove session from history & database
async function deletePastSession(sessionId) {
  if (!confirm('Kya aap is previous mentorship session ko delete karna chahte hain?')) {
    return;
  }

  const user = AppState.currentUser;

  // 1. Remove from local state
  if (AppState.pastMentorshipSessions) {
    AppState.pastMentorshipSessions = AppState.pastMentorshipSessions.filter(s => s.id !== sessionId);
  }

  // 2. Remove from guest localStorage
  try {
    const guestSessions = JSON.parse(localStorage.getItem('vivek_guest_sessions') || '[]');
    const filtered = guestSessions.filter(s => s.id !== sessionId);
    localStorage.setItem('vivek_guest_sessions', JSON.stringify(filtered));
  } catch (e) {}

  // 3. UI Animation & Removal
  const card = document.getElementById(`session_card_${sessionId}`);
  if (card) {
    card.style.opacity = '0';
    card.style.transform = 'scale(0.92)';
    setTimeout(() => {
      card.remove();
      const remaining = AppState.pastMentorshipSessions?.length || 0;
      const badgeEl = document.getElementById('pastSessionsCountBadge');
      if (badgeEl) badgeEl.innerText = `${remaining} Sessions`;
      const portalCount = document.getElementById('portalStatsMentorships');
      if (portalCount) portalCount.innerText = remaining.toString();
      if (remaining === 0) {
        const emptyEl = document.getElementById('pastSessionsEmptyState');
        const listEl = document.getElementById('pastSessionsList');
        if (emptyEl) emptyEl.style.display = 'block';
        if (listEl) listEl.style.display = 'none';
      }
    }, 280);
  }

  showToast('🗑️ Mentorship session delete ho gayi!');

  // 4. Delete from backend if logged in
  try {
    await fetch('/api/mentor/delete-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        user_id: user ? user.id : null
      })
    });
  } catch (err) {
    console.warn('Backend delete notification failed, deleted locally:', err);
  }
}

// 4. SHARE KARNA: Share to Youth Sangam, WhatsApp or Copy to Clipboard
function openSharePastSession(sessionId) {
  const hiddenInput = document.getElementById('shareSessionIdInput');
  if (hiddenInput) hiddenInput.value = sessionId;
  document.getElementById('shareMentorshipModalOverlay')?.classList.add('open');
}

function closeShareMentorshipModal() {
  document.getElementById('shareMentorshipModalOverlay')?.classList.remove('open');
}

async function executeShareToSangam() {
  const sessionId = document.getElementById('shareSessionIdInput')?.value;
  closeShareMentorshipModal();
  if (!sessionId) return;
  await sharePastSessionToSangam(sessionId);
}

function executeShareToWhatsApp() {
  const sessionId = document.getElementById('shareSessionIdInput')?.value;
  closeShareMentorshipModal();
  const sessions = AppState.pastMentorshipSessions || [];
  const sess = sessions.find(s => s.id === sessionId);
  if (!sess) return;

  const text = `🪷 *Vivek Saarthi Mentorship Wisdom* 🪷\n\n❓ *Question:* "${sess.problem_text}"\n\n📖 *Story:* ${sess.story_title}\n${sess.story_text}\n\n⚡ *Mahavakya Slogan:* ${sess.sanskrit_slogan}\n"${sess.slogan_translation}"\n\n💡 *Life Lesson:* ${sess.story_lesson}\n\nGuided by Vivek Saarthi (Swami Vivekananda AI Mentor)`;
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
  showToast('📲 Opening WhatsApp to share wisdom!');
}

async function executeCopyWisdomToClipboard() {
  const sessionId = document.getElementById('shareSessionIdInput')?.value;
  closeShareMentorshipModal();
  const sessions = AppState.pastMentorshipSessions || [];
  const sess = sessions.find(s => s.id === sessionId);
  if (!sess) return;

  const text = `🪷 Vivek Saarthi Mentorship Wisdom 🪷\n\nQuestion: "${sess.problem_text}"\nStory: ${sess.story_title}\n${sess.story_text}\n\nMahavakya: ${sess.sanskrit_slogan}\n"${sess.slogan_translation}"\n\nLesson: ${sess.story_lesson}`;

  try {
    await navigator.clipboard.writeText(text);
    triggerConfetti();
    showToast('📋 Wisdom copied to clipboard! Share it with anyone 🙏');
  } catch (err) {
    showToast('Wisdom text ready to share!');
  }
}

function openEditPastSession(sessionId) {
  const sessions = AppState.pastMentorshipSessions || [];
  const sess = sessions.find(s => s.id === sessionId);
  if (!sess) return;

  document.getElementById('editSessionIdInput').value = sess.id;
  document.getElementById('editSessionProblemInput').value = sess.problem_text || '';
  document.getElementById('editSessionNotesInput').value = sess.notes || '';

  document.getElementById('editMentorshipModalOverlay')?.classList.add('open');
}

function closeEditMentorshipModal() {
  document.getElementById('editMentorshipModalOverlay')?.classList.remove('open');
}

async function saveEditedMentorshipSession() {
  const sessId = document.getElementById('editSessionIdInput')?.value;
  const newProblem = (document.getElementById('editSessionProblemInput')?.value || '').trim();
  const newNotes = (document.getElementById('editSessionNotesInput')?.value || '').trim();
  const user = AppState.currentUser;

  if (!sessId) return;

  try {
    const res = await fetch('/api/mentor/edit-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessId,
        user_id: user?.id,
        problem_text: newProblem,
        notes: newNotes,
        lang: AppState.currentLang || 'hinglish'
      })
    });
    const data = await res.json();

    if (data.status === 'success') {
      closeEditMentorshipModal();
      showToast('💾 Mentorship session & notes saved!');
      fetchAndRenderPastSessions();
    } else {
      showToast(data.message || 'Failed to save session', 'error');
    }
  } catch (err) {
    showToast('Network error while saving session', 'error');
  }
}

async function sharePastSessionToSangam(sessionId) {
  const user = AppState.currentUser;
  if (!user || !user.id) {
    showToast('⚠️ Please login to share session in Youth Sangam!', 'error');
    openAuthModal();
    return;
  }

  try {
    const res = await fetch('/api/mentor/share-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        user_id: user.id
      })
    });
    const data = await res.json();

    if (data.status === 'success') {
      if (data.karma_points !== undefined) {
        AppState.karmaPoints = data.karma_points;
        user.karma_points = data.karma_points;
        localStorage.setItem('vivek_karma', data.karma_points.toString());
        localStorage.setItem('vivek_user', JSON.stringify(user));
        updateKarmaDisplay();
      }
      triggerConfetti();
      showToast('🎉 Wisdom shared to Youth Sangam (+20 Karma awarded)!');
      renderCommunityFeed();
    } else {
      showToast(data.message || 'Share failed', 'error');
    }
  } catch (err) {
    showToast('Failed to share session', 'error');
  }
}

// ==========================================
// 11. DAILY SADHANA CHECK-IN (+50 KARMA)
// ==========================================
async function claimDailyCheckinBonus() {
  const user = AppState.currentUser;
  if (!user || !user.id) {
    addKarma(50, 'Daily Sadhana Check-in');
    return;
  }

  try {
    const res = await fetch('/api/user/daily-checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id })
    });
    const data = await res.json();

    if (data.status === 'success') {
      AppState.karmaPoints = data.karma_points;
      user.karma_points = data.karma_points;
      localStorage.setItem('vivek_karma', data.karma_points.toString());
      localStorage.setItem('vivek_user', JSON.stringify(user));
      updateKarmaDisplay();
      triggerConfetti();
      showToast('🎁 Daily Sadhana Bonus (+50 Karma) Claimed!');
    } else {
      showToast(data.message || 'Check-in failed', 'error');
    }
  } catch (err) {
    addKarma(50, 'Daily Sadhana Check-in');
  }
}

// ==========================================
// 12. YOUTH SANGAM IDENTITY & ACCOUNT SWITCHER
// ==========================================
let selectedCommAvatar = '🦁';

function openCommunityAccountModal() {
  renderSavedAccountsList();
  document.getElementById('communityAccountModalOverlay')?.classList.add('open');
}

function closeCommunityAccountModal() {
  document.getElementById('communityAccountModalOverlay')?.classList.remove('open');
}

function selectCommAvatar(avatar) {
  selectedCommAvatar = avatar;
  const disp = document.getElementById('selectedCommAvatarDisplay');
  if (disp) disp.innerText = avatar;
}

function renderSavedAccountsList() {
  const container = document.getElementById('savedAccountsContainer');
  if (!container) return;

  let accounts = [];
  try {
    accounts = JSON.parse(localStorage.getItem('vivek_accounts') || '[]');
  } catch (e) {}

  const current = AppState.currentUser;
  if (current && !accounts.some(a => (current.id && a.id === current.id) || (current.username && a.username === current.username))) {
    accounts.push(current);
    localStorage.setItem('vivek_accounts', JSON.stringify(accounts));
  }

  if (accounts.length === 0) {
    container.innerHTML = `
      <div style="font-size: 0.8rem; color: var(--text-dim); padding: 0.5rem 0;">
        No other accounts saved yet. Create your first community persona below!
      </div>
    `;
    return;
  }

  container.innerHTML = accounts.map(acc => {
    const isActive = current && ((acc.id && current.id && acc.id === current.id) || (acc.username && current.username && acc.username === current.username));
    const karmaVal = acc.karma_points !== undefined ? acc.karma_points : 350;
    const clickTarget = acc.id ? acc.id : `'${acc.username}'`;

    return `
      <div class="saved-account-row ${isActive ? 'active' : ''}">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 1.5rem;">${acc.avatar || '🧘‍♂️'}</span>
          <div>
            <strong style="color: #fff; font-size: 0.88rem;">${acc.name}</strong>
            <span style="color: var(--gold-light); font-size: 0.76rem; display: block;">@${acc.username || 'seeker'}</span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <span style="color: var(--emerald-glow); font-size: 0.78rem; font-weight: 700;">${karmaVal} Karma</span>
          ${isActive ? `
            <span style="background: rgba(16,185,129,0.2); color: var(--emerald-glow); font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: var(--radius-full); font-weight: 700;">
              Active ✓
            </span>
          ` : `
            <button onclick="switchToAccount(${clickTarget})" style="background: var(--gold-primary); border: none; color: #070f1e; font-size: 0.74rem; font-weight: 700; padding: 0.35rem 0.75rem; border-radius: var(--radius-full); cursor: pointer;">
              Switch
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

function switchToAccount(identifier) {
  let accounts = [];
  try {
    accounts = JSON.parse(localStorage.getItem('vivek_accounts') || '[]');
  } catch (e) {}

  const target = accounts.find(a => a.id === identifier || a.username === identifier);
  if (!target) return;

  setUserSession(target);
  closeCommunityAccountModal();
  showToast(`🎉 Switched identity to ${target.name} (@${target.username})!`);
}

async function submitCreateCommunityAccount() {
  const name = (document.getElementById('commAccNameInput')?.value || '').trim() || 'Sangam Seeker';
  const username = (document.getElementById('commAccUsernameInput')?.value || '').trim().toLowerCase();
  const bio = (document.getElementById('commAccBioInput')?.value || '').trim();

  try {
    const res = await fetch('/api/community/create-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        username: username,
        avatar: selectedCommAvatar,
        bio: bio,
        spiritual_goal: 'Youth Sangam Peer Guidance'
      })
    });
    const data = await res.json();

    if (data.status === 'success') {
      setUserSession(data.user);
      closeCommunityAccountModal();
      showToast(`🎉 New Community Identity Created: @${data.user.username}! (+350 Karma)`);
      triggerConfetti();
    } else {
      showToast(data.message || 'Creation failed', 'error');
    }
  } catch (err) {
    showToast('Network error while creating account', 'error');
  }
}

// ==========================================
// 10. ACTION PLAN, HIGGSFIELD & 7/14-DAY SADHANA ENGINE
// ==========================================

function renderActionPlanAndGuidance(data) {
  const mindsetEl = document.getElementById('mindsetShiftText');
  if (mindsetEl) {
    mindsetEl.innerText = data.mindset_shift || "Failure ko identity mat banao. Galti identify karo aur action par wapas aao.";
  }

  const stepsGrid = document.getElementById('actionStepsGrid');
  if (stepsGrid) {
    const steps = data.action_plan || [
      { num: 1, title: "Name the Fear", desc: "Write down the exact failure you fear to take away its power." },
      { num: 2, title: "Identify 3 Root Mistakes", desc: "Find objective execution flaws without guilt or blaming luck." },
      { num: 3, title: "Choose Smallest Action", desc: "Pick 1 weak topic and complete a 45-minute focused sprint." },
      { num: 4, title: "Track Effort, Not Result", desc: "Measure today's completed 45-min sprint, not distant outcomes." },
      { num: 5, title: "Diagnostic Self-Test", desc: "Take a 10-minute low-stakes test tomorrow to cement mastery." }
    ];

    stepsGrid.innerHTML = steps.map(s => `
      <div class="action-step-card" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(212,175,55,0.25); border-radius: var(--radius-md); padding: 0.95rem; display: flex; gap: 0.75rem; align-items: flex-start; transition: all 0.2s ease;">
        <span style="background: linear-gradient(135deg, var(--saffron-primary), var(--gold-primary)); color: #070f1e; font-weight: 800; font-size: 0.85rem; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 0 10px rgba(255,115,0,0.3);">${s.num}</span>
        <div>
          <div style="font-size: 0.88rem; font-weight: 700; color: #fff; margin-bottom: 0.2rem;">${s.title}</div>
          <div style="font-size: 0.78rem; color: #cbd5e1; line-height: 1.4;">${s.desc}</div>
        </div>
      </div>
    `).join('');
  }
}

function renderNext24Checklist(items) {
  if (!items || items.length === 0) {
    items = [
      { id: "chk_1", text: "Apni diary mein failure ka sabse bada darr aur 3 mistakes likho", done: false },
      { id: "chk_2", text: "Jo topic sabse mushkil lagta hai, uska smallest portion choose karo", done: false },
      { id: "chk_3", text: "Bina kisi digital notification ke 45-min study sprint complete karo", done: false },
      { id: "chk_4", text: "Sone se pehle 2 minutes gratitude aur Mahavakya ka smaran karo", done: false }
    ];
  }
  AppState.next24Items = items;
  updateNext24ChecklistUI();
}

function updateNext24ChecklistUI() {
  const container = document.getElementById('next24ChecklistItems');
  if (!container) return;

  const total = AppState.next24Items.length;
  const completed = AppState.next24Items.filter(i => i.done).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const fill = document.getElementById('checklistProgressBarFill');
  if (fill) fill.style.width = `${pct}%`;

  const badge = document.getElementById('next24ProgressBadge');
  if (badge) badge.innerText = `${completed} / ${total} Completed (${pct}%)`;

  container.innerHTML = AppState.next24Items.map((item, idx) => `
    <div class="checklist-item-row" onclick="toggleNext24Item(${idx})" style="display: flex; align-items: center; gap: 0.7rem; background: ${item.done ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)'}; border: 1px solid ${item.done ? 'var(--emerald-glow)' : 'rgba(212,175,55,0.2)'}; padding: 0.65rem 0.9rem; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s ease;">
      <div style="width: 20px; height: 20px; border-radius: 4px; border: 1.5px solid ${item.done ? 'var(--emerald-glow)' : 'var(--border-gold)'}; background: ${item.done ? 'var(--emerald-glow)' : 'transparent'}; display: flex; align-items: center; justify-content: center; color: #070f1e; font-size: 0.78rem; font-weight: 900; transition: all 0.2s ease;">
        ${item.done ? '✓' : ''}
      </div>
      <span style="font-size: 0.84rem; color: ${item.done ? '#94a3b8' : '#f1f5f9'}; text-decoration: ${item.done ? 'line-through' : 'none'}; flex: 1;">
        ${item.text}
      </span>
      ${item.done ? '<span style="font-size: 0.72rem; color: var(--emerald-glow); font-weight: 700; background: rgba(16,185,129,0.15); padding: 0.15rem 0.5rem; border-radius: var(--radius-full);">Done +5 Karma</span>' : ''}
    </div>
  `).join('');
}

function toggleNext24Item(idx) {
  if (!AppState.next24Items[idx]) return;
  const item = AppState.next24Items[idx];
  item.done = !item.done;

  if (item.done) {
    showToast("🎉 Micro-action completed! +5 Karma awarded!", "success");
    addKarma(5, "24h Checklist Action");
    triggerConfetti();
  }

  updateNext24ChecklistUI();
}

function toggleHiggsfieldInspector() {
  const content = document.getElementById('higgsfieldInspectorContent');
  const chevron = document.getElementById('higgsfieldChevron');
  if (!content) return;

  const isHidden = content.style.display === 'none' || content.style.display === '';
  content.style.display = isHidden ? 'block' : 'none';
  if (chevron) chevron.innerText = isHidden ? '▲' : '▼';
}

function renderHiggsfieldInspector(data) {
  const container = document.getElementById('higgsfieldScenesList');
  if (!container) return;

  const payload = data.higgsfield_payload || {};
  const scenes = payload.scenes || [
    { scene: 1, title: "The Inner Conflict", camera: "Slow cinematic push-in", prompt: "Young seeker facing overwhelming dilemma, transitioning to golden dawn.", duration_sec: 22.5 },
    { scene: 2, title: "Parable in Motion", camera: "Dynamic tracking shot", prompt: "Young Narendra boldly confronting aggressive troop of monkeys on Varanasi ghats.", duration_sec: 22.5 },
    { scene: 3, title: "3 Practical Actions", camera: "Medium shot, glowing Sanskrit geometric icons", prompt: "Swami Vivekananda revealing 3 micro-steps in glowing script.", duration_sec: 22.5 },
    { scene: 4, title: "Mahavakya Awakening", camera: "Crane up into radiant sunrise", prompt: "Swami Vivekananda raising hand in blessing. Celestial slogan banner.", duration_sec: 22.5 }
  ];

  container.innerHTML = scenes.map(s => `
    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-sm); padding: 0.75rem; border-left: 3px solid var(--gold-primary);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
        <span style="font-weight: 700; color: var(--gold-light); font-size: 0.8rem;">Scene ${s.scene}: ${s.title}</span>
        <span style="font-size: 0.7rem; color: #94a3b8; font-family: monospace;">${s.duration_sec}s • ${s.camera || 'Cinematic Camera'}</span>
      </div>
      <div style="font-size: 0.75rem; color: #cbd5e1; font-style: italic; background: rgba(0,0,0,0.4); padding: 0.45rem 0.6rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05);">
        "${s.prompt}"
      </div>
    </div>
  `).join('');
}

function copyHiggsfieldPromptPayload() {
  const payload = AppState.currentGuidance?.higgsfield_payload;
  if (!payload) {
    showToast("Higgsfield payload not generated yet", "error");
    return;
  }
  navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
    .then(() => showToast("📋 Controlled Higgsfield generation payload copied to clipboard!", "success"))
    .catch(() => showToast("Could not copy payload", "error"));
}

function selectSadhanaPeriod(days) {
  AppState.selectedSadhanaDays = days;
  const c7 = document.getElementById('periodCard7');
  const c14 = document.getElementById('periodCard14');
  const btnText = document.getElementById('launchSadhanaBtnText');

  if (days === 7) {
    if (c7) {
      c7.style.border = '2px solid var(--gold-primary)';
      c7.style.background = 'rgba(212,175,55,0.12)';
    }
    if (c14) {
      c14.style.border = '1px solid rgba(212,175,55,0.3)';
      c14.style.background = 'rgba(255,255,255,0.03)';
    }
    if (btnText) btnText.innerText = 'Launch 7-Day Sadhana Challenge (+35 Karma/Day)';
  } else {
    if (c7) {
      c7.style.border = '1px solid rgba(212,175,55,0.3)';
      c7.style.background = 'rgba(255,255,255,0.03)';
    }
    if (c14) {
      c14.style.border = '2px solid var(--saffron-primary)';
      c14.style.background = 'rgba(255,115,0,0.15)';
    }
    if (btnText) btnText.innerText = 'Launch 14-Day Sadhana Challenge (+35 Karma/Day + Bonus)';
  }
}

async function launchSadhanaChallenge() {
  const user = AppState.currentUser;
  const days = AppState.selectedSadhanaDays || 7;
  const situationInput = document.getElementById('userSituationInput');
  const problem = (situationInput?.value || '').trim() || (AppState.currentGuidance?.story?.title || 'Personal Transformation');
  const category = AppState.currentGuidance?.category || 'fear_courage';
  const lang = AppState.currentLang || 'hinglish';

  try {
    const res = await fetch('/api/sadhana/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user ? user.id : null,
        duration_days: days,
        category: category,
        problem_text: problem,
        lang: lang
      })
    });
    const data = await res.json();

    if (data.status === 'success' && data.challenge) {
      AppState.activeSadhanaChallenge = data.challenge;
      showToast(data.message || `🎉 ${days}-Day Sadhana Challenge activated!`, 'success');
      triggerConfetti();

      // Render dashboard and scroll smoothly
      renderSadhanaDashboard(data.challenge);
      const dash = document.getElementById('activeSadhanaDashboard');
      if (dash) {
        dash.style.display = 'block';
        dash.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      showToast(data.message || 'Could not start Sadhana challenge', 'error');
    }
  } catch (err) {
    showToast('Network error while launching challenge', 'error');
  }
}

async function loadActiveSadhanaChallenge() {
  const user = AppState.currentUser;
  try {
    const url = user ? `/api/sadhana/current?user_id=${user.id}` : `/api/sadhana/current`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'success' && data.challenge) {
      AppState.activeSadhanaChallenge = data.challenge;
      renderSadhanaDashboard(data.challenge);
    }
  } catch (err) {
    console.error("Failed to load active sadhana challenge", err);
  }
}

function renderSadhanaDashboard(challenge) {
  const dash = document.getElementById('activeSadhanaDashboard');
  if (!dash || !challenge) return;

  dash.style.display = 'block';

  document.getElementById('dashboardChallengeTitle').innerText = challenge.title;
  document.getElementById('dashboardStreakTag').innerText = `🔥 Streak: ${Math.max(1, challenge.completed_days)} Days`;
  document.getElementById('dashboardKarmaEarnedTag').innerText = `⚡ +${challenge.completed_days * 35} Karma`;
  document.getElementById('dashboardProgressText').innerText = `Progress: Day ${challenge.current_day} of ${challenge.duration_days} (${challenge.completion_pct}%)`;
  document.getElementById('dashboardDaysRemainingText').innerText = `${Math.max(0, challenge.duration_days - challenge.completed_days)} Days Remaining`;
  document.getElementById('dashboardProgressBarFill').style.width = `${challenge.completion_pct}%`;

  const tasksList = document.getElementById('sadhanaDailyTasksList');
  if (!tasksList) return;

  tasksList.innerHTML = (challenge.tasks || []).map(task => {
    const isVerified = task.status === 'verified';
    const isActiveToday = task.day_number === challenge.current_day && !isVerified;
    const isLocked = task.day_number > challenge.current_day && !isVerified;

    let statusHeader = '';
    if (isVerified) {
      statusHeader = `<span style="background: rgba(16,185,129,0.18); border: 1px solid var(--emerald-glow); color: var(--emerald-glow); font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: var(--radius-full);">✅ Verified Completed (+${task.karma_reward} Karma)</span>`;
    } else if (isActiveToday) {
      statusHeader = `<span style="background: linear-gradient(135deg, rgba(255,115,0,0.25), rgba(212,175,55,0.25)); border: 1px solid var(--gold-primary); color: var(--gold-light); font-size: 0.75rem; font-weight: 800; padding: 0.2rem 0.65rem; border-radius: var(--radius-full); animation: pulse 2s infinite;">📍 Active Today (Earn +${task.karma_reward} Karma)</span>`;
    } else {
      statusHeader = `<span style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #94a3b8; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: var(--radius-full);">🔒 Day ${task.day_number} (Locked)</span>`;
    }

    let proofDisplayOrStudio = '';

    if (isVerified) {
      // Show verified evidence
      let evidence = '';
      if (task.proof_type === 'photo') {
        evidence = `
          <div style="margin-top: 0.75rem;">
            <div style="font-size: 0.75rem; color: var(--gold-light); margin-bottom: 0.3rem;">📷 Submitted Photo Proof:</div>
            <img src="${task.proof_content}" alt="Proof" style="max-height: 160px; max-width: 100%; border-radius: 8px; border: 1.5px solid var(--border-gold); object-fit: contain; background: #000;">
          </div>
        `;
      } else if (task.proof_type === 'audio') {
        evidence = `
          <div style="margin-top: 0.75rem;">
            <div style="font-size: 0.75rem; color: var(--gold-light); margin-bottom: 0.3rem;">🎙️ Submitted Audio Reflection:</div>
            <audio controls src="${task.proof_content}" style="width: 100%; max-width: 320px; height: 38px;"></audio>
          </div>
        `;
      } else {
        evidence = `
          <div style="margin-top: 0.75rem; background: rgba(0,0,0,0.3); border-left: 2px solid var(--emerald-glow); padding: 0.6rem 0.8rem; border-radius: 4px; font-size: 0.8rem; color: #cbd5e1; font-style: italic;">
            "${task.proof_content}"
          </div>
        `;
      }
      proofDisplayOrStudio = evidence;

    } else if (isActiveToday) {
      // Render Verification Studio
      proofDisplayOrStudio = `
        <div class="proof-submission-studio" style="margin-top: 1rem; background: rgba(5,11,22,0.7); border: 1px solid rgba(212,175,55,0.3); border-radius: var(--radius-md); padding: 1.25rem;">
          <div style="font-size: 0.82rem; font-weight: 700; color: #fff; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.4rem;">
            <span>📸</span> <span>Submit Proof of Execution to Earn +${task.karma_reward} Karma:</span>
          </div>

          <!-- Mode Tabs -->
          <div style="display: flex; gap: 0.5rem; margin-bottom: 0.85rem;">
            <button class="scene-chip-btn active" id="tabBtnPhoto_${task.day_number}" onclick="switchProofMode(${task.day_number}, 'photo')" style="background: rgba(212,175,55,0.2); border: 1px solid var(--border-gold); color: #fff; font-size: 0.76rem; padding: 0.3rem 0.7rem; border-radius: var(--radius-full); cursor: pointer;">
              📷 Upload Photo
            </button>
            <button class="scene-chip-btn" id="tabBtnAudio_${task.day_number}" onclick="switchProofMode(${task.day_number}, 'audio')" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-size: 0.76rem; padding: 0.3rem 0.7rem; border-radius: var(--radius-full); cursor: pointer;">
              🎙️ Record Voice Note
            </button>
            <button class="scene-chip-btn" id="tabBtnNote_${task.day_number}" onclick="switchProofMode(${task.day_number}, 'note')" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-size: 0.76rem; padding: 0.3rem 0.7rem; border-radius: var(--radius-full); cursor: pointer;">
              ✍️ Write Journal Note
            </button>
          </div>

          <!-- 1. Photo Upload Container -->
          <div id="proofContainerPhoto_${task.day_number}" style="display: block;">
            <label style="display: block; border: 2px dashed rgba(212,175,55,0.4); border-radius: var(--radius-md); padding: 1.25rem; text-align: center; cursor: pointer; background: rgba(255,255,255,0.02); transition: all 0.2s ease;">
              <span style="font-size: 1.8rem; display: block; margin-bottom: 0.3rem;">📷</span>
              <span style="font-size: 0.85rem; font-weight: 700; color: var(--gold-light);">Click to Upload Photo or Snap from Camera</span>
              <span style="font-size: 0.75rem; color: #94a3b8; display: block; margin-top: 0.2rem;">(e.g., photo of your notes, worksheet, exercise or desk setup)</span>
              <input type="file" accept="image/*" capture="environment" style="display: none;" onchange="handleDayPhotoUpload(${task.day_number}, this)">
            </label>
            <div id="photoPreviewBox_${task.day_number}" style="display: none; margin-top: 0.75rem; text-align: center;">
              <img id="photoPreviewImg_${task.day_number}" src="" style="max-height: 160px; max-width: 100%; border-radius: 8px; border: 1px solid var(--border-gold);">
              <div style="font-size: 0.75rem; color: var(--emerald-glow); margin-top: 0.3rem;">✓ Photo Ready for Verification</div>
            </div>
          </div>

          <!-- 2. Voice Note Container -->
          <div id="proofContainerAudio_${task.day_number}" style="display: none; text-align: center;">
            <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(212,175,55,0.3); border-radius: var(--radius-md); padding: 1.25rem;">
              <div style="font-size: 0.85rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">
                Live In-Browser Voice Reflection (15–45 sec)
              </div>
              <div style="display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <button class="secondary-pill-btn" id="voiceRecBtn_${task.day_number}" onclick="toggleDayVoiceRecording(${task.day_number})" style="background: rgba(239,68,68,0.2); border: 1px solid #ef4444; color: #ef4444; font-weight: 700; padding: 0.5rem 1rem; border-radius: var(--radius-full); cursor: pointer; display: flex; align-items: center; gap: 0.4rem;">
                  <span id="voiceRecDot_${task.day_number}" style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444; display: inline-block;"></span>
                  <span id="voiceRecBtnText_${task.day_number}">🎙️ Start Recording</span>
                </button>
                <span id="voiceRecTimer_${task.day_number}" style="font-family: monospace; font-size: 0.9rem; color: #fff;">00:00 / 00:30</span>
              </div>
              <div id="audioPlaybackBox_${task.day_number}" style="display: none; margin-top: 0.75rem;">
                <audio id="audioPlaybackEl_${task.day_number}" controls style="width: 100%; max-width: 300px; height: 36px;"></audio>
                <div style="font-size: 0.75rem; color: var(--emerald-glow); margin-top: 0.3rem;">✓ Audio Recorded &amp; Ready</div>
              </div>
            </div>
          </div>

          <!-- 3. Note Container -->
          <div id="proofContainerNote_${task.day_number}" style="display: none;">
            <textarea id="noteInputEl_${task.day_number}" placeholder="Write your reflection: What went well? What did you accomplish today?" style="width: 100%; height: 80px; background: rgba(0,0,0,0.5); border: 1px solid rgba(212,175,55,0.3); border-radius: var(--radius-sm); padding: 0.7rem; color: #fff; font-size: 0.84rem; outline: none;"></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
            <button class="primary-gold-btn" onclick="submitDayProof(${task.day_number})" style="padding: 0.65rem 1.4rem; font-weight: 800; border-radius: var(--radius-md); cursor: pointer;">
              ✨ Submit Verified Proof &amp; Claim +${task.karma_reward} Karma
            </button>
          </div>
        </div>
      `;
    }

    return `
      <div class="sadhana-day-card" style="background: ${isVerified ? 'rgba(16,185,129,0.04)' : (isActiveToday ? 'rgba(11,26,48,0.9)' : 'rgba(255,255,255,0.02)')}; border: 1.5px solid ${isVerified ? 'rgba(16,185,129,0.4)' : (isActiveToday ? 'var(--gold-primary)' : 'rgba(255,255,255,0.08)')}; border-radius: var(--radius-lg); padding: 1.4rem; box-shadow: ${isActiveToday ? '0 0 25px rgba(212,175,55,0.15)' : 'none'};">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem; flex-wrap: wrap; gap: 0.5rem;">
          <div style="font-size: 1.05rem; font-weight: 800; color: #fff;">
            Day ${task.day_number}: ${task.title}
          </div>
          ${statusHeader}
        </div>

        <div style="font-size: 0.82rem; color: var(--gold-light); font-style: italic; margin-bottom: 0.5rem;">
          📜 <strong>Principle:</strong> "${task.principle}"
        </div>

        <div style="font-size: 0.85rem; color: #e2e8f0; line-height: 1.45; margin-bottom: 0.5rem;">
          ${task.instruction}
        </div>

        <div style="font-size: 0.78rem; color: #94a3b8; background: rgba(255,255,255,0.03); padding: 0.4rem 0.6rem; border-radius: 4px; display: inline-block;">
          💡 <strong>Suggested Proof:</strong> ${task.suggested_proof}
        </div>

        ${proofDisplayOrStudio}
      </div>
    `;
  }).join('');
}

function switchProofMode(dayNum, mode) {
  const pBox = document.getElementById(`proofContainerPhoto_${dayNum}`);
  const aBox = document.getElementById(`proofContainerAudio_${dayNum}`);
  const nBox = document.getElementById(`proofContainerNote_${dayNum}`);

  const pBtn = document.getElementById(`tabBtnPhoto_${dayNum}`);
  const aBtn = document.getElementById(`tabBtnAudio_${dayNum}`);
  const nBtn = document.getElementById(`tabBtnNote_${dayNum}`);

  if (pBox) pBox.style.display = mode === 'photo' ? 'block' : 'none';
  if (aBox) aBox.style.display = mode === 'audio' ? 'block' : 'none';
  if (nBox) nBox.style.display = mode === 'note' ? 'block' : 'none';

  [pBtn, aBtn, nBtn].forEach(b => {
    if (b) {
      b.style.background = 'rgba(255,255,255,0.05)';
      b.style.border = '1px solid rgba(255,255,255,0.15)';
      b.style.color = '#cbd5e1';
    }
  });

  const activeBtn = mode === 'photo' ? pBtn : (mode === 'audio' ? aBtn : nBtn);
  if (activeBtn) {
    activeBtn.style.background = 'rgba(212,175,55,0.2)';
    activeBtn.style.border = '1px solid var(--border-gold)';
    activeBtn.style.color = '#fff';
  }
}

function handleDayPhotoUpload(dayNum, input) {
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    const base64Data = e.target.result;
    AppState.dayPendingProof[dayNum] = { type: 'photo', content: base64Data };

    const pBox = document.getElementById(`photoPreviewBox_${dayNum}`);
    const imgEl = document.getElementById(`photoPreviewImg_${dayNum}`);
    if (pBox && imgEl) {
      imgEl.src = base64Data;
      pBox.style.display = 'block';
    }
    showToast("📷 Photo attached! Ready to submit.", "success");
  };
  reader.readAsDataURL(file);
}

async function toggleDayVoiceRecording(dayNum) {
  const btn = document.getElementById(`voiceRecBtn_${dayNum}`);
  const btnText = document.getElementById(`voiceRecBtnText_${dayNum}`);
  const dot = document.getElementById(`voiceRecDot_${dayNum}`);
  const timer = document.getElementById(`voiceRecTimer_${dayNum}`);

  if (!AppState.isRecordingVoice) {
    // Start recording
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      AppState.mediaRecorderInstance = new MediaRecorder(stream);
      AppState.voiceRecordChunks = [];

      AppState.mediaRecorderInstance.ondataavailable = e => {
        if (e.data.size > 0) AppState.voiceRecordChunks.push(e.data);
      };

      AppState.mediaRecorderInstance.onstop = () => {
        const audioBlob = new Blob(AppState.voiceRecordChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result;
          AppState.dayPendingProof[dayNum] = { type: 'audio', content: base64Audio };

          const playBox = document.getElementById(`audioPlaybackBox_${dayNum}`);
          const playEl = document.getElementById(`audioPlaybackEl_${dayNum}`);
          if (playBox && playEl) {
            playEl.src = base64Audio;
            playBox.style.display = 'block';
          }
          showToast("🎙️ Voice note recorded! Click play to review or submit.", "success");
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      AppState.mediaRecorderInstance.start();
      AppState.isRecordingVoice = true;
      AppState.voiceRecordSeconds = 0;

      if (btnText) btnText.innerText = '⏹️ Stop Recording';
      if (dot) {
        dot.style.background = '#ef4444';
        dot.style.boxShadow = '0 0 10px #ef4444';
      }

      AppState.voiceTimerInterval = setInterval(() => {
        AppState.voiceRecordSeconds++;
        const s = AppState.voiceRecordSeconds;
        const formatted = `00:${s < 10 ? '0' + s : s} / 00:30`;
        if (timer) timer.innerText = formatted;

        if (s >= 30) {
          toggleDayVoiceRecording(dayNum);
        }
      }, 1000);

    } catch (err) {
      showToast("Microphone access denied or not available. You can write a note or upload a photo instead!", "error");
    }

  } else {
    // Stop recording
    if (AppState.mediaRecorderInstance && AppState.mediaRecorderInstance.state !== 'inactive') {
      AppState.mediaRecorderInstance.stop();
    }
    AppState.isRecordingVoice = false;
    clearInterval(AppState.voiceTimerInterval);

    if (btnText) btnText.innerText = '🎙️ Record Again';
    if (dot) dot.style.boxShadow = 'none';
  }
}

async function submitDayProof(dayNum) {
  const challenge = AppState.activeSadhanaChallenge;
  if (!challenge) {
    showToast("No active challenge found", "error");
    return;
  }

  let proofObj = AppState.dayPendingProof[dayNum];
  const noteEl = document.getElementById(`noteInputEl_${dayNum}`);
  const noteText = (noteEl?.value || '').trim();

  if (!proofObj && noteText) {
    proofObj = { type: 'note', content: noteText };
  }

  if (!proofObj || !proofObj.content) {
    showToast("⚠️ Please upload a photo, record audio, or write a reflection note!", "error");
    return;
  }

  const user = AppState.currentUser;

  try {
    const res = await fetch('/api/sadhana/submit-proof', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        challenge_id: challenge.id,
        day_number: dayNum,
        proof_type: proofObj.type,
        proof_content: proofObj.content,
        user_id: user ? user.id : null
      })
    });
    const data = await res.json();

    if (data.status === 'success') {
      showToast(data.message || `🎉 Day ${dayNum} verified! +${data.karma_awarded} Karma!`, 'success');
      triggerConfetti();

      if (data.new_karma !== undefined) {
        AppState.karmaPoints = data.new_karma;
        localStorage.setItem('vivek_karma', AppState.karmaPoints.toString());
        if (user) {
          user.karma_points = AppState.karmaPoints;
          localStorage.setItem('vivek_user', JSON.stringify(user));
        }
        updateKarmaDisplay();
      }

      AppState.activeSadhanaChallenge = data.challenge;
      renderSadhanaDashboard(data.challenge);
      delete AppState.dayPendingProof[dayNum];

    } else {
      showToast(data.message || "Failed to verify proof", "error");
    }
  } catch (err) {
    showToast("Network error while submitting proof", "error");
  }
}

// Saarthi AI Chatbot Copilot Handlers
async function sendSaarthiChatMessage() {
  const input = document.getElementById('saarthiChatInput');
  const text = (input?.value || '').trim();
  if (!text) return;

  input.value = '';
  appendChatMessage('user', text);

  const lang = AppState.currentLang || 'hinglish';
  const user = AppState.currentUser;
  const problemContext = (document.getElementById('userSituationInput')?.value || '').trim();

  try {
    const res = await fetch('/api/mentor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        problem_context: problemContext,
        lang: lang,
        user_id: user ? user.id : null
      })
    });
    const data = await res.json();

    if (data.status === 'success') {
      setTimeout(() => {
        appendChatMessage('mentor', data.reply);
      }, 500);
    }
  } catch (err) {
    appendChatMessage('mentor', "उत्तिष्ठत जाग्रत! Arise, awake! Stay focused on your small micro-steps today. Strength is within you!");
  }
}

function sendQuickChatMessage(text) {
  const input = document.getElementById('saarthiChatInput');
  if (input) input.value = text;
  sendSaarthiChatMessage();
}

function appendChatMessage(sender, msg) {
  const history = document.getElementById('saarthiChatHistory');
  if (!history) return;

  const isUser = sender === 'user';
  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.gap = '0.6rem';
  row.style.alignItems = 'flex-start';
  row.style.justifyContent = isUser ? 'flex-end' : 'flex-start';

  if (isUser) {
    row.innerHTML = `
      <div style="background: rgba(255, 115, 0, 0.25); border: 1px solid var(--saffron-primary); border-radius: 12px; border-top-right-radius: 2px; padding: 0.75rem 1rem; color: #fff; font-size: 0.88rem; line-height: 1.4; max-width: 80%;">
        ${msg}
      </div>
      <span style="font-size: 1.2rem;">🙋</span>
    `;
  } else {
    row.innerHTML = `
      <span style="font-size: 1.2rem;">🧘‍♂️</span>
      <div style="background: rgba(212, 175, 55, 0.12); border: 1px solid var(--border-gold); border-radius: 12px; border-top-left-radius: 2px; padding: 0.8rem 1rem; color: #f1f5f9; font-size: 0.88rem; line-height: 1.5; max-width: 85%;">
        ${msg}
      </div>
    `;
  }

  history.appendChild(row);
  history.scrollTop = history.scrollHeight;
}

// Hero Banner Collapse / Expand Toggle
function toggleHeroCollapse() {
  const banner = document.getElementById('heroBanner');
  const btn = document.getElementById('heroCollapseToggleBtn');
  if (!banner) return;
  banner.classList.toggle('collapsed');
  const isCollapsed = banner.classList.contains('collapsed');
  if (btn) btn.innerHTML = isCollapsed ? '📖 Expand Hero' : '⚡ Compact';
  localStorage.setItem('vivek_hero_collapsed', isCollapsed ? '1' : '0');
}

// Restore collapsed hero preference if saved
(function initHeroState() {
  if (localStorage.getItem('vivek_hero_collapsed') === '1') {
    const banner = document.getElementById('heroBanner');
    const btn = document.getElementById('heroCollapseToggleBtn');
    if (banner) banner.classList.add('collapsed');
    if (btn) btn.innerHTML = '📖 Expand Hero';
  }
})();


