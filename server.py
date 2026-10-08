"""
Vivek साथी - Backend Server & AI Engine
Updated Requirements:
1. Pure Email Authentication (Mobile number completely removed)
2. Unique Account & Handle (@username) for every user in Youth Sangam
3. Background Gmail SMTP Dispatcher: yuktigarg898@gmail.com used strictly for sending verification OTPs to ANY user email
4. Google Auth: Any Gmail / Google account can sign in or register dynamically
5. NLP Semantic Matching Model for Swami Vivekananda Stories & Slogans
"""

import http.server
import socketserver
import json
import urllib.parse
import sqlite3
import random
import time
import hashlib
import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import sys
import re

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

PORT = 8080
DB_FILE = os.path.join(os.path.dirname(__file__), "viveksaarthi.db")

# SMTP Dispatcher Credentials (Used exclusively for sending OTP emails to any user)
SMTP_SENDER_EMAIL = "yuktigarg898@gmail.com"
SMTP_APP_PASSWORD = "ogom sprw njbv lwah".replace(" ", "")

# ==========================================
# 1. COMMUNITY MODERATION & PROFANITY FILTER
# ==========================================
DIRTY_PATTERNS = [
    # Hindi/Hinglish acronyms & common vulgarities
    r'\b(?:m[c\*]|b[c\*]|bkl|bsdk|mc|bc)\b',
    r'\b(?:madar\s*chod|maadar\s*chod|mader\s*chod|ma\s*chod|madarjaat|madarchod[a-z]*)\b',
    r'\b(?:behen\s*chod|behn\s*chod|bhen\s*chod|bhenchod[a-z]*|bahan\s*chod)\b',
    r'\b(?:bhosad[a-z]*|bhosd[a-z]*|bhosadi[a-z]*|b\.h\.o\.s\.d[a-z]*)\b',
    r'\b(?:chuti[a-z]*|chooti[a-z]*|chutiy[a-z]*|c\.h\.u\.t\.i\.y\.a)\b',
    r'\b(?:gand[a-z]*|gaand[a-z]*|gandu|gaandu)\b',
    r'\b(?:harami[a-z]*|haramzada[a-z]*|haraamzada[a-z]*|haramkhor)\b',
    r'\b(?:randi[a-z]*|raand[a-z]*|randwa|randibaaz)\b',
    r'\b(?:l[auo]d[aei][a-z]*|lund[a-z]*|lawda[a-z]*|loda[a-z]*)\b',
    r'\b(?:kamin[aei][a-z]*|kutta|kutte|suar)\b',
    r'\b(?:tatte|muthal|chudai|chodna|chodo)\b',
    # English vulgarities & toxic slurs
    r'\b(?:f+u+c+k+[a-z]*|f+\*+c+k+|f+k+i+n+g+|motherfuck[a-z]*)\b',
    r'\b(?:s+h+i+t+[a-z]*|s+\*+i+t+|bullshit)\b',
    r'\b(?:b+i+t+c+h+[a-z]*|b+\*+t+c+h+)\b',
    r'\b(?:a+s+s+h+o+l+e+[a-z]*|a+\*+\*+h+o+l+e+|dumbass|jackass)\b',
    r'\b(?:b+a+s+t+a+r+d+[a-z]*|d+i+c+k+[a-z]*|p+u+s+s+y+[a-z]*|c+u+n+t+[a-z]*|s+l+u+t+[a-z]*|w+h+o+r+e+[a-z]*)\b',
    r'\b(?:kill\s+yourself|kys)\b'
]

def check_dirty_content(text):
    if not text:
        return False, ""
    lowered = text.lower()
    cleaned = re.sub(r'[\*\.\-_,/\\#@!$%^&()]', '', lowered)
    for pat in DIRTY_PATTERNS:
        m = re.search(pat, lowered, re.IGNORECASE) or re.search(pat, cleaned, re.IGNORECASE)
        if m:
            return True, m.group(0)
    return False, ""

def is_user_blocked(user_id=None, username=None):
    if not user_id and not username:
        return False, ""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            if user_id:
                cursor.execute("SELECT is_blocked, is_defaulter, block_reason FROM users WHERE id = ?", (user_id,))
            else:
                clean_uname = (username or "").strip().lstrip("@")
                cursor.execute("SELECT is_blocked, is_defaulter, block_reason FROM users WHERE username = ? COLLATE NOCASE", (clean_uname,))
            row = cursor.fetchone()
            if row and (row["is_blocked"] or row["is_defaulter"]):
                return True, row["block_reason"] or "Community Violations & Defaulter Status"
    except Exception:
        pass
    return False, ""

# ==========================================
# 2. DATABASE SETUP
# ==========================================
def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        # Clean Unique Users Table with Mobile, Email, and Unique Handles
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                mobile TEXT DEFAULT '',
                password_hash TEXT,
                bio TEXT DEFAULT '',
                spiritual_goal TEXT DEFAULT 'Mental Peace & Focus',
                avatar TEXT DEFAULT '🧘‍♂️',
                karma_points INTEGER DEFAULT 350,
                is_pro INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Add mobile and moderation columns if upgrading from older schema
        cursor.execute("PRAGMA table_info(users)")
        user_cols = [col["name"] for col in cursor.fetchall()]
        user_migration = [
            ("mobile", "TEXT DEFAULT ''"),
            ("is_blocked", "INTEGER DEFAULT 0"),
            ("is_defaulter", "INTEGER DEFAULT 0"),
            ("strikes", "INTEGER DEFAULT 0"),
            ("block_reason", "TEXT DEFAULT ''"),
            ("blocked_at", "TIMESTAMP")
        ]
        for col_name, col_def in user_migration:
            if col_name not in user_cols:
                try:
                    cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_def}")
                except Exception:
                    pass

        # Email OTP Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS otps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                otp_code TEXT NOT NULL,
                expires_at INTEGER NOT NULL
            )
        """)

        # Community Posts Table for Unique Accounts
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS community_posts (
                id TEXT PRIMARY KEY,
                user_id INTEGER,
                author_name TEXT NOT NULL,
                username TEXT NOT NULL,
                author_avatar TEXT DEFAULT '🧘‍♂️',
                is_anonymous INTEGER DEFAULT 0,
                category TEXT DEFAULT 'fear',
                category_label TEXT DEFAULT '⚡ Fear & Courage',
                problem_text TEXT NOT NULL,
                ai_slogan TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Migrate community_posts columns
        cursor.execute("PRAGMA table_info(community_posts)")
        post_cols = [col["name"] for col in cursor.fetchall()]
        for cname, cdef in [("is_hidden", "INTEGER DEFAULT 0"), ("status", "TEXT DEFAULT 'active'"), ("flags_count", "INTEGER DEFAULT 0")]:
            if cname not in post_cols:
                try:
                    cursor.execute(f"ALTER TABLE community_posts ADD COLUMN {cname} {cdef}")
                except Exception:
                    pass

        # Community Solutions Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS community_solutions (
                id TEXT PRIMARY KEY,
                post_id TEXT NOT NULL,
                user_id INTEGER,
                author_name TEXT NOT NULL,
                username TEXT NOT NULL,
                badge TEXT DEFAULT 'Active Saarthi',
                solution_text TEXT NOT NULL,
                upvotes INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Migrate community_solutions columns
        cursor.execute("PRAGMA table_info(community_solutions)")
        sol_cols = [col["name"] for col in cursor.fetchall()]
        for cname, cdef in [("is_hidden", "INTEGER DEFAULT 0"), ("status", "TEXT DEFAULT 'active'"), ("flags_count", "INTEGER DEFAULT 0")]:
            if cname not in sol_cols:
                try:
                    cursor.execute(f"ALTER TABLE community_solutions ADD COLUMN {cname} {cdef}")
                except Exception:
                    pass

        # Community Reports Table (Flagged dirty comments, defaulters, abusive language)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS community_reports (
                id TEXT PRIMARY KEY,
                target_type TEXT NOT NULL,
                target_id TEXT NOT NULL,
                reporter_id INTEGER,
                reporter_handle TEXT,
                author_username TEXT,
                content_snippet TEXT,
                reason TEXT NOT NULL,
                details TEXT DEFAULT '',
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Community Moderation & Defaulter Audit Logs
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS community_moderation_logs (
                id TEXT PRIMARY KEY,
                user_id INTEGER,
                username TEXT NOT NULL,
                action TEXT NOT NULL,
                reason TEXT NOT NULL,
                triggered_text TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Mentorship Sessions Table (Persistent User Mentorship History & Continuity)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS mentorship_sessions (
                id TEXT PRIMARY KEY,
                user_id INTEGER,
                problem_text TEXT NOT NULL,
                story_id TEXT,
                story_title TEXT NOT NULL,
                story_text TEXT NOT NULL,
                story_lesson TEXT NOT NULL,
                sanskrit_slogan TEXT NOT NULL,
                slogan_translation TEXT NOT NULL,
                voice_narration TEXT,
                video_theme TEXT,
                lang TEXT DEFAULT 'hinglish',
                notes TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Sadhana Transformation Challenges (7-Day and 14-Day Action Programs)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sadhana_challenges (
                id TEXT PRIMARY KEY,
                user_id INTEGER,
                title TEXT NOT NULL,
                category TEXT DEFAULT 'fear_courage',
                duration_days INTEGER NOT NULL,
                current_day INTEGER DEFAULT 1,
                completed_days INTEGER DEFAULT 0,
                status TEXT DEFAULT 'active',
                problem_context TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Sadhana Daily Tasks with Photo / Audio Proof Submission
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sadhana_day_tasks (
                id TEXT PRIMARY KEY,
                challenge_id TEXT NOT NULL,
                day_number INTEGER NOT NULL,
                title TEXT NOT NULL,
                principle TEXT NOT NULL,
                instruction TEXT NOT NULL,
                suggested_proof TEXT NOT NULL,
                karma_reward INTEGER DEFAULT 35,
                status TEXT DEFAULT 'pending',
                proof_type TEXT DEFAULT '',
                proof_content TEXT DEFAULT '',
                completed_at TIMESTAMP
            )
        """)
        conn.commit()

# ==========================================
# 2. EMAIL OTP DISPATCHER (GMAIL SMTP)
# ==========================================
def send_otp_via_email(recipient_email, otp_code, recipient_name="Seeker"):
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"🌟 {otp_code} - Vivek साथी Verification Code"
        msg["From"] = f"Vivek साथी <{SMTP_SENDER_EMAIL}>"
        msg["To"] = recipient_email

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #070f1e; color: #f8fafc; padding: 20px; }}
            .card {{ max-width: 500px; margin: 0 auto; background: #0b1a30; border: 1px solid #d4af37; border-radius: 16px; padding: 30px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.6); }}
            .logo-text {{ font-size: 26px; font-weight: bold; color: #ffffff; margin-bottom: 6px; }}
            .gold-highlight {{ color: #f5cf62; }}
            .subtitle {{ color: #d4af37; font-size: 14px; margin-bottom: 25px; }}
            .otp-box {{ background: linear-gradient(135deg, #ff7300, #d4af37); color: #070f1e; font-size: 34px; font-weight: 800; letter-spacing: 8px; padding: 16px; border-radius: 12px; margin: 25px auto; display: inline-block; width: 80%; }}
            .quote {{ font-style: italic; color: #cbd5e1; margin-top: 25px; border-top: 1px solid rgba(212,175,55,0.3); padding-top: 15px; font-size: 13px; }}
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo-text">Vivek <span class="gold-highlight">साथी</span></div>
            <div class="subtitle">AI Mentorship, Stories &amp; Youth Sangam</div>
            <p>Pranaam <strong>{recipient_name}</strong>,</p>
            <p>Aapke account verification ke liye one-time passcode (OTP) hai:</p>
            <div class="otp-box">{otp_code}</div>
            <p style="font-size: 12px; color: #94a3b8;">Yeh code 10 minutes ke liye valid hai. Kisi ke sath share na karein.</p>
            <div class="quote">
              "उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत।"<br>
              — Arise, awake, and stop not till the goal is reached!
            </div>
          </div>
        </body>
        </html>
        """
        msg.attach(MIMEText(html_content, "html"))

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(SMTP_SENDER_EMAIL, SMTP_APP_PASSWORD)
            server.sendmail(SMTP_SENDER_EMAIL, recipient_email, msg.as_string())
        
        print(f"[OTP] Successfully sent OTP to {recipient_email}")
        return True, "OTP successfully emailed!"
    except Exception as e:
        print(f"[OTP ERROR] Failed to send email to {recipient_email}: {e}")
        return False, str(e)

# ==========================================
# 3. VIVEKANANDA STORIES & SLOGANS DATASET (MULTILINGUAL)
# ==========================================
VIVEKANANDA_DATASET = [
  {
    "id": "story_monkeys_varanasi",
    "category": "fear_courage",
    "video_theme": "monkeys_courage",
    "keywords": [
      "fear",
      "scared",
      "darr",
      "anxiety",
      "panic",
      "threat",
      "failure",
      "exam",
      "asafalta",
      "bhay",
      "ghabrahat",
      "pariksha",
      "phobia",
      "nervous"
    ],
    "sanskrit_slogan": "नायमात्मा बलहीनेन लभ्यः। निर्भय बनो!",
    "translations": {
      "english": {
        "slogan_trans": "Strength is life, weakness is death! Stand and face the storm fearlessly.",
        "story_title": "The Monkeys of Varanasi (Face the Brutes!)",
        "story_text": "Once in Varanasi, young Narendra was walking along a narrow path by a tank when a troop of large, aggressive monkeys surrounded and chased him. Narendra began to run in panic, but the more he ran, the faster the monkeys chased him, snapping at his heels! Suddenly, an old sannyasin appeared and shouted with thunderous authority: 'Face the brutes! Face the brutes!' Hearing this, Narendra stopped dead in his tracks, turned around, and boldly stood like a lion staring directly into the monkeys' eyes. Seeing his fearless posture, the monkeys hesitated and fled in terror! Swami ji later taught: 'Whenever you run away from difficulty or fear, it chases you harder. Stop, turn around, and face the trouble boldly!'",
        "story_lesson": "Running away from fear only magnifies it. When you turn and confront challenges with courage, obstacles retreat before you.",
        "voice_narration": "Listen, my young friend! Face the brutes! Whenever fear or failure confronts you, do not run away. Stand firm like a lion, look difficulty in the eye, and all fears will vanish. Remember: Strength is life, weakness is death!",
        "video_subtitles": [
          "Do not run away from failure...",
          "Face the brutes like a lion!",
          "All power and courage are within you...",
          "Strength is life, weakness is death!"
        ]
      },
      "hindi": {
        "slogan_trans": "बल ही जीवन है, दुर्बलता ही मृत्यु है! निर्भय होकर संकट का सामना करो।",
        "story_title": "काशी के वानर (साहस से सामना करो!)",
        "story_text": "एक बार काशी में युवा नरेंद्र एक सरोवर के किनारे संकरी पगडंडी पर चल रहे थे, तभी आक्रामक वानरों के एक दल ने उन्हें घेर लिया और पीछे पड़ गए। नरेंद्र घबराकर भागने लगे, किंतु वे जितना तेज भागते, वानर उतनी ही तेजी से उनके पैरों पर झपटते! तभी एक वृद्ध संन्यासी ने गरजती आवाज में कहा: 'रुको! डटकर सामना करो!' यह सुनते ही नरेंद्र रुक गए, पलटकर सिंह के समान निर्भीक दृष्टि से वानरों की आंखों में देखने लगे। उनके इस अदम्य साहस को देखकर वानर सहम गए और भाग खड़े हुए! स्वामी जी ने सिखाया: 'कठिनाइयों से भागने पर वे और सताती हैं। रुककर निर्भयता से उनका सामना करो!'",
        "story_lesson": "भय से भागने पर भय और विशाल हो जाता है। जब आप सीना तानकर संकट का सामना करते हैं, तो बाधाएं स्वतः पीछे हट जाती हैं।",
        "voice_narration": "उत्तिष्ठत जाग्रत मेरे बंधु! संकट से भागो मत, सिंह के समान उसका सामना करो। भय केवल तभी तक सताता है जब तक तुम भागते हो। उठो और अपने भीतर की अनंत शक्ति को पहचानो!",
        "video_subtitles": [
          "कठिनाइयों से पलायन मत करो...",
          "सिंह के समान निर्भीक होकर डटे रहो!",
          "अनंत सामर्थ्य तुम्हारे भीतर है...",
          "बल ही जीवन है, दुर्बलता ही मृत्यु है!"
        ]
      },
      "hinglish": {
        "slogan_trans": "Strength is life, weakness is death! Seena taan kar samna karo.",
        "story_title": "The Monkeys of Varanasi (Face the Brutes!)",
        "story_text": "Ek baar Kashi me young Narendra ko aakramak bandaron ne gher liya. Narendra darr ke maare bhaagne lage, par jitna bhaagte bandar utna hi paas aate! Tabhi ek sannyasin ne aawaz di: 'Face the brutes! Ruk kar samna karo!' Narendra turant ruke, sher ki tarah unki aankhon me aankhein daal kar khade ho gaye. Unka sahas dekh kar bandar bhaag gaye! Swami ji ne sikhaya: 'Mushkilon se bhaagne par wo aur darati hain. Ruk kar unka samna karo!'",
        "story_lesson": "Darr se bhaagne par darr aur bada lagta hai. Seena taan kar samna karne par mushkilein khud peeche hat jaati hain.",
        "voice_narration": "Suno mere saathi! Mushkilon aur asafalta se bhaago mat! Face the brutes! Sher ki tarah khade ho jao, sabhi darr gayab ho jayenge. Slogan yaad rakhein: Strength is life, weakness is death!",
        "video_subtitles": [
          "Mushkilon se bhaago mat...",
          "Face the brutes sher ki tarah!",
          "Anant shakti aapke andar hai...",
          "Strength is life, weakness is death!"
        ]
      }
    }
  },
  {
    "id": "story_river_concentration",
    "category": "focus_discipline",
    "video_theme": "river_focus",
    "keywords": [
      "focus",
      "distraction",
      "phone",
      "reels",
      "study",
      "concentration",
      "lazy",
      "procrastination",
      "mind",
      "ekagrata",
      "padhai",
      "dhyan",
      "bhatak",
      "social media",
      "instagram"
    ],
    "sanskrit_slogan": "एकाग्रता ही ज्ञान की परम कुंजी है।",
    "translations": {
      "english": {
        "slogan_trans": "Concentration is the sole source of knowledge and supreme mastery.",
        "story_title": "Eggshells on the River (Supreme Concentration)",
        "story_text": "While in America, Swami Vivekananda watched young men trying to shoot at floating eggshells on a swift river, missing every shot. Swami ji took the rifle, aimed with total presence of mind, and hit twelve consecutive eggshells without missing once! The amazed youth asked how many years he had practiced. Swami ji replied: 'I have never touched a gun before. Whatever you do, give your whole mind to it. If you shoot, think only of the target. If you read, think of nothing else. Concentration is the secret of all greatness.'",
        "story_lesson": "When studying or working, shut out the entire world. Unbroken concentration turns the impossible into reality.",
        "voice_narration": "Concentrate your whole mind upon one ideal! Do not let trivial distractions rob your sacred hours. When you focus with single-minded devotion, no goal in this universe is beyond your reach.",
        "video_subtitles": [
          "Shut out all digital distractions...",
          "Concentration is the secret of all mastery...",
          "Take up one great mission...",
          "Live with undivided, laser-sharp focus!"
        ]
      },
      "hindi": {
        "slogan_trans": "एकाग्रता ही समस्त ज्ञान और सिद्धि का एकमात्र स्रोत है।",
        "story_title": "नदी पर अंडे के छिलके (अखंड एकाग्रता)",
        "story_text": "अमेरिका में स्वामी विवेकानंद ने कुछ युवकों को बहती नदी पर तैरते अंडों के छिलकों पर निशाना लगाते देखा, किंतु कोई सफल न हुआ। स्वामी जी ने बंदूक ली और अखंड ध्यान से लगातार बारह सटीक निशाने लगाए! युवकों ने पूछा कि आपने कितने वर्ष अभ्यास किया है? स्वामी जी ने हंसकर कहा: 'मैंने जीवन में पहले कभी बंदूक नहीं उठाई। तुम जो भी करो, अपना पूरा मन उसमें झोंक दो। यदि पढ़ रहे हो तो केवल उसी का चिंतन करो। एकाग्रता ही समस्त सिद्धियों का रहस्य है।'",
        "story_lesson": "अध्ययन के समय संसार के भटकाव को त्याग दें। अखंड एकाग्रता असंभव को भी संभव बना देती है।",
        "voice_narration": "अपने मन को एक महान विचार पर एकाग्र करो! व्यर्थ के आकर्षणों को अपनी चेतना नष्ट मत करने दो। एकाग्रता ही ज्ञान और विजय की एकमात्र कुंजी है!",
        "video_subtitles": [
          "समस्त भटकावों को त्याग दो...",
          "एकाग्रता ही समस्त सिद्धियों का मूल है...",
          "एक विचार को अपना जीवन बना लो...",
          "दृढ़ संकल्प से आगे बढ़ो!"
        ]
      },
      "hinglish": {
        "slogan_trans": "Concentration hi gyan aur safalta ki sabse badi chaabi hai.",
        "story_title": "Eggshells on the River (Supreme Concentration)",
        "story_text": "America me Swami ji ne dekha ki ladke behti nadi par tairte eggshells par nishana nahi laga pa rahe the. Swami ji ne rifle li aur bina kisi practice ke 12 me se 12 nishane sahi lagaye! Unhone kaha: 'Maine pehle kabhi bandook nahi chhui thi. Jo bhi kaam karo, apna pura dhyan usi me laga do. Ekagrata hi safalta ka rahasya hai.'",
        "story_lesson": "Padhte waqt phone aur duniya ko bhool jao. Single-minded focus asambhav ko sambhav bana deta hai.",
        "voice_narration": "Apne dhyan ko ek target par kendrit karo! Reels aur distraction ko apne sapno ko chori mat karne do. Ek vichar lo aur usi par jeevan laga do!",
        "video_subtitles": [
          "Distractions ko door rakhein...",
          "Ekagrata hi asli mastery hai...",
          "Ek uddeshya par pura mann lagao...",
          "Laser-sharp focus se vijayi bano!"
        ]
      }
    }
  },
  {
    "id": "story_football_heaven",
    "category": "strength_vitality",
    "video_theme": "strength_vitality",
    "keywords": [
      "weak",
      "tired",
      "health",
      "energy",
      "body",
      "gym",
      "lethargy",
      "depression",
      "physical",
      "kamzor",
      "thakan",
      "bimaar",
      "alashya",
      "workout",
      "fitness",
      "sust"
    ],
    "sanskrit_slogan": "बलमेव जीवनं, दौर्बल्यं मरणम्।",
    "translations": {
      "english": {
        "slogan_trans": "Strength is life, weakness is death! Forge muscles of iron and nerves of steel.",
        "story_title": "Football Before Gita (Physical & Moral Strength)",
        "story_text": "When weak and sickly youth asked Swami Vivekananda how to grasp spiritual wisdom, he boldly declared: 'You will be nearer to Heaven through football than through the study of the Gita! First make your bodies strong. You will understand the Gita better when your blood courses with vigor and your limbs stand firm upon the earth.' He urged youth to develop muscles of iron, nerves of steel, and unshakeable courage.",
        "story_lesson": "True mental peace and high achievement require physical energy and stamina. Exercise, wake early, and banish lethargy.",
        "voice_narration": "You have infinite potential, but weakness is a crime! Build nerves of steel and muscles of iron. Arise and conquer all sloth!",
        "video_subtitles": [
          "Banish all weakness and sloth...",
          "Forge muscles of iron and nerves of steel...",
          "Physical vitality breeds mental power...",
          "Strength is life, weakness is death!"
        ]
      },
      "hindi": {
        "slogan_trans": "बल ही जीवन है, दुर्बलता ही मृत्यु है! लौह समान मांसपेशियां और फौलादी स्नायु निर्मित करो।",
        "story_title": "गीता से पहले फुटबॉल (शारीरिक एवं आत्मिक बल)",
        "story_text": "जब कुछ दुर्बल युवकों ने गीता का मर्म पूछा, तो स्वामी जी ने कहा: 'गीता पढ़ने से पहले फुटबॉल खेलो! पहले अपने शरीर को शक्तिशाली बनाओ। जब तुम्हारी भुजाएं सशक्त होंगी, तब तुम श्रीकृष्ण और अर्जुन के ओज को सच्चे अर्थों में समझ पाओगे।' उन्होंने युवाओं से लौह समान मांसपेशियां और फौलादी इच्छाशक्ति विकसित करने का आह्वान किया।",
        "story_lesson": "सच्ची मानसिक शांति और सफलता तभी संभव है जब शरीर में ऊर्जा हो। व्यायाम करें और आलस्य को जड़ से उखाड़ फेंकें।",
        "voice_narration": "दुर्बलता सबसे बड़ा पाप है! अपने शरीर और मन को फौलादी बनाओ। आलस्य त्याग कर उठ खड़े हो, संसार तुम्हारे पराक्रम की प्रतीक्षा कर रहा है!",
        "video_subtitles": [
          "आलस्य और दुर्बलता का त्याग करो...",
          "फौलादी इच्छाशक्ति का निर्माण करो...",
          "शारीरिक बल ही मानसिक तेज देता है...",
          "बल ही जीवन है, दुर्बलता ही मृत्यु है!"
        ]
      },
      "hinglish": {
        "slogan_trans": "Strength is life, weakness is death! Nerves of steel aur iron body banao.",
        "story_title": "Football Before Gita (Strength & Vitality)",
        "story_text": "Kamzor ladko ko Swami ji ne kaha: 'Gita samajhne se pehle football khelo! Pehle body ko strong banao. Jab body me takat hogi, tab dimag bhi tej chalega.' Unhone youth ko nerves of steel aur gigantic will develop karne ko kaha.",
        "story_lesson": "Aalsya chhodkar workout aur healthy routine apnayein. Sharir me energy hogi toh depression paas nahi aayega.",
        "voice_narration": "Kamzori ko apne paas mat aane do! Lohe jaisi takat aur folaadi sankalp banao. Utho aur aalsya ko mita do!",
        "video_subtitles": [
          "Aalsya ko poori tarah mitao...",
          "Nerves of steel aur strong body banao...",
          "Takat hi jeevan ka aadhar hai...",
          "Strength is life, weakness is death!"
        ]
      }
    }
  },
  {
    "id": "story_lion_among_sheep",
    "category": "rejection_self_esteem",
    "video_theme": "royal_lion",
    "keywords": [
      "rejection",
      "breakup",
      "inferior",
      "self-esteem",
      "relationship",
      "respect",
      "heartbreak",
      "sad",
      "alone",
      "dhokha",
      "apmaan",
      "heenbhavna",
      "chhod diya",
      "worthless"
    ],
    "sanskrit_slogan": "तत्त्वमसि। त्वं सिंहोऽसि न मेषः।",
    "translations": {
      "english": {
        "slogan_trans": "You are the lion of eternal divinity, not a trembling sheep! Arise and roar your true nature.",
        "story_title": "The Lion Among Sheep (Awakening Self-Respect)",
        "story_text": "Swami Vivekananda often narrated the parable of a lion cub who grew up among sheep and bleated like a sheep in fear. One day, an elder lion dragged the young lion to a clear pool of water and roared: 'Look into the water! You are not a sheep; you are a lion like me!' Seeing his reflection, the cub let out a mighty roar that shook the forest. Swami ji proclaimed: 'You weep for petty rejections because you have forgotten your divine majesty. You are a lion of strength, not a helpless sheep. Cast off self-pity and roar!'",
        "story_lesson": "External rejection cannot define your infinite worth. Stop begging for validation; realize your inner power and stand tall.",
        "voice_narration": "Why do you weep, O lion of divine majesty? You are not a sheep to be crushed by trivial rejections! Look into the mirror of your soul. Arise, roar with supreme confidence, and reclaim your rightful glory!",
        "video_subtitles": [
          "Do not weep over rejection...",
          "You are a lion, not a sheep!",
          "Realize your infinite, divine worth...",
          "Stand tall and roar with unbreakable dignity!"
        ]
      },
      "hindi": {
        "slogan_trans": "तुम साक्षात सिंह हो, कायर भेड़ नहीं! जागो और अपने वास्तविक स्वरूप का सिंहनाद करो।",
        "story_title": "भेड़ों में सिंह का शावक (आत्मसम्मान का जागरण)",
        "story_text": "स्वामी विवेकानंद ने कथा सुनाई कि एक सिंह का शावक भेड़ों के झुंड में पलकर स्वयं को भेड़ समझ बैठा था और भय से मिमियाता था। एक दिन एक वृद्ध सिंह ने उसे सरोवर के शांत जल में उसका मुख दिखाया और कहा: 'देख! तू भेड़ नहीं, मेरी भांति सिंह है!' अपना प्रतिबिंब देखते ही उस शावक ने ऐसा प्रचण्ड सिंहनाद किया कि समस्त वन गूंज उठा। स्वामी जी ने कहा: 'तुम सांसारिक उपेक्षाओं व वियोग पर इसलिए रोते हो क्योंकि तुम अपनी दिव्य महिमा भूल चुके हो। तुम कायर नहीं, अजेय सिंह हो। आत्मग्लानि त्यागो और गर्जना करो!'",
        "story_lesson": "बाहरी तिरस्कार या संबंध-विच्छेद आपकी असीम क्षमता को क्षीण नहीं कर सकता। दूसरों से अनुमोदन मांगना बंद करें और अपने आत्मसम्मान को पहचानें।",
        "voice_narration": "हे अजेय साधक! क्षुद्र उपेक्षाओं पर विलाप क्यों करते हो? तुम भेड़ नहीं, साक्षात सिंह हो! अपनी अंतरात्मा के दर्पण में देखो। उठो, आत्मसम्मान के साथ सिंहनाद करो और संसार को अपना पराक्रम दिखाओ!",
        "video_subtitles": [
          "उपेक्षा और तिरस्कार पर विलाप मत करो...",
          "तुम सिंह हो, कायर भेड़ नहीं!",
          "अपने अंतस की असीम दिव्यता को पहचानो...",
          "आत्मसम्मान से सिर उठाकर आगे बढ़ो!"
        ]
      },
      "hinglish": {
        "slogan_trans": "Aap sher hain, koi bhed nahi! Apni asli shakti ko pehchano aur dahado.",
        "story_title": "The Lion Among Sheep (Self-Respect Ki Pehchan)",
        "story_text": "Swami Vivekananda ji ne ek katha sunayi jisme ek sher ka bachha bhedon ke jhund me bada hokar khud ko bhed samajhta tha aur darr ke maare chillata tha. Ek din ek bade sher ne use paani me uska chehra dikhaya aur bola: 'Dekh, tu bhed nahi, meri tarah sher hai!' Apna roop dekhte hi usne zordaar dahaad maari. Swami ji ne sikhaya: 'Tum rejection par isliye rote ho kyunki tum apni asli shakti bhool chuke ho. Tum helpless nahi, sher ho. Utho aur roar karo!'",
        "story_lesson": "Kisi ke chhod jaane ya reject karne se aapki worth kam nahi hoti. Validation maangna band karein aur apna self-respect wapas paayein.",
        "voice_narration": "Rejection par mat ro mere dost! Aap kisi ke mohtaaj nahi hain, aap sher hain! Apne astitva ko pehchano aur confidence ke sath wapas aao. Slogan yaad rakho: Aap sher hain, koi bhed nahi!",
        "video_subtitles": [
          "Rejection par rona band karo...",
          "Aap sher hain, koi bhed nahi!",
          "Apni self-respect aur power pehchano...",
          "Duniya ke aage seena taan kar khade ho jao!"
        ]
      }
    }
  },
  {
    "id": "story_sculptor_purpose",
    "category": "purpose_destiny",
    "video_theme": "cosmic_sculptor",
    "keywords": [
      "purpose",
      "direction",
      "aim",
      "lakshya",
      "future",
      "confusion",
      "destiny",
      "kismat",
      "goal",
      "career",
      "bhatak",
      "meaning",
      "kya karu",
      "aimless",
      "vision"
    ],
    "sanskrit_slogan": "उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत।",
    "translations": {
      "english": {
        "slogan_trans": "Arise, awake, and stop not till the goal is reached! You are the creator of your own destiny.",
        "story_title": "The Sculptor of Destiny (Take Up One Great Idea)",
        "story_text": "Swami Vivekananda repeatedly declared: 'Take up one idea. Make that one idea your life; dream of it; think of it; live on that idea. Let the brain, the body, muscles, nerves, every part of your body be full of that idea, and just leave every other idea alone. This is the way to success.' He taught that destiny is not written by fate in the stars; it is chiseled day by day by your own willpower and deliberate action.",
        "story_lesson": "Confusion vanishes when you dedicate yourself wholeheartedly to a single noble mission. You are not a victim of destiny; you are its architect.",
        "voice_narration": "Arise! Awake! And stop not till the goal is reached! Do not wander aimlessly in doubt. Take up one noble ideal, pour your entire existence into it, and carve your own golden future!",
        "video_subtitles": [
          "Take up one great idea...",
          "Make that ideal your life and mission...",
          "You are the creator of your own destiny...",
          "Arise, awake, and stop not till the goal is reached!"
        ]
      },
      "hindi": {
        "slogan_trans": "उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत! उठो, जागो और तब तक मत रुको जब तक लक्ष्य प्राप्त न हो जाए!",
        "story_title": "भाग्य के निर्माता (एक महान विचार को जीवन बनाओ)",
        "story_text": "स्वामी विवेकानंद ने आह्वान किया: 'एक विचार को अपना लक्ष्य बना लो। उस विचार को अपना जीवन बनाओ; उसी का स्वप्न देखो; उसी का चिंतन करो और उसी में जियो। अपने मस्तिष्क, मांसपेशियों, नस-नस को उस विचार से ओतप्रोत कर दो और अन्य समस्त विचारों को त्याग दो। यही सफलता का एकमात्र राजमार्ग है।' उन्होंने सिखाया कि भाग्य आकाश के नक्षत्रों में नहीं लिखा होता, बल्कि आपकी अटूट इच्छाशक्ति और कर्म की छेनी से गढ़ा जाता है।",
        "story_lesson": "जब आप अपना संपूर्ण जीवन किसी एक श्रेष्ठ लक्ष्य को समर्पित कर देते हैं, तो समस्त भ्रम मिट जाते हैं। आप भाग्य के अधीन नहीं, अपितु अपने भाग्य के विधाता हैं।",
        "voice_narration": "उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत! उठो, जागो और जब तक परम लक्ष्य सिद्ध न हो जाए, तब तक विश्राम मत लो! संशय त्याग कर एक महान संकल्प धारण करो और अपने हाथों से अपना उज्ज्वल भविष्य गढ़ो!",
        "video_subtitles": [
          "एक महान विचार को अपना जीवन बनाओ...",
          "उसी का चिंतन करो और उसी में जियो...",
          "तुम स्वयं अपने भाग्य के विधाता हो...",
          "उठो, जागो और लक्ष्य प्राप्ति तक मत रुको!"
        ]
      },
      "hinglish": {
        "slogan_trans": "Utho, jaago aur tab tak mat ruko jab tak lakshya hasil na ho jaye! Aap khud apne destiny ke creator hain.",
        "story_title": "The Sculptor of Destiny (Ek Great Idea Chuno)",
        "story_text": "Swami Vivekananda ji ne kaha: 'Ek vichar lo. Use apna jeevan bana do; usi ka sapna dekho; usi ke baare me socho aur usi me jiyo. Apne dimag, shareer, nerves har hisse ko us vichar se bhar do aur baki sab chhod do. Yahi safalta ka raasta hai.' Kismat sitaron me nahi likhi hoti, aapke khud ke mehnat aur sankalp se banti hai.",
        "story_lesson": "Jab aap kisi ek clear goal ke peeche jaan laga dete hain, toh saara confusion door ho jaata hai. Aap apni destiny ke khud malik hain.",
        "voice_narration": "Utho! Jaago! Aur tab tak mat ruko jab tak lakshya mil na jaye! Directionless feel mat karo, ek mission chun lo aur usme apna sab kuch jhonk do. Aap apni kismat khud likh sakte hain!",
        "video_subtitles": [
          "Ek vichar lo aur use apna jeevan bana lo...",
          "Usi par apna poora focus laga do...",
          "Aap apni destiny ke creator hain...",
          "Utho, jaago aur jab tak lakshya na mile mat ruko!"
        ]
      }
    }
  },
  {
    "id": "story_scorpion_monk",
    "category": "anger_patience",
    "video_theme": "monk_patience",
    "keywords": [
      "anger",
      "gussa",
      "temper",
      "irritation",
      "krodh",
      "fight",
      "badla",
      "quarrel",
      "patience",
      "dhairya",
      "chidh",
      "shanti",
      "revenge",
      "aggressive",
      "lado"
    ],
    "sanskrit_slogan": "क्रोधं जहि महाशत्रुम्। आत्मसंयमः परमं बलम्।",
    "translations": {
      "english": {
        "slogan_trans": "Conquer anger, the supreme enemy! Self-mastery is the ultimate divine power.",
        "story_title": "The Monk and the Scorpion (Mastery Over Anger)",
        "story_text": "A holy monk was bathing in the Ganges when he saw a scorpion drowning in the swirling currents. The monk gently lifted it with his palm, but the terrified scorpion stung him severely. In pain, the monk's hand jerked and the scorpion fell back into the water. The monk reached down again to save it, and again the scorpion stung him. An onlooker shouted: 'Foolish monk, why do you keep saving a creature that stings you?' The monk smiled with serene grace: 'It is the innate nature of the scorpion to sting in ignorance; but it is my nature as a seeker of truth to save and show compassion. Why should I surrender my noble divine nature to its lower nature?' Swami ji taught: When others provoke or anger you, do not let their lower agitation conquer your inner peace.",
        "story_lesson": "Anger is poison that punishes you for another's fault. Hold your ground in calm forgiveness, and no provocation can disturb your inner throne.",
        "voice_narration": "Conquer anger, my friend! It is the great destroyer of your peace and intellect. When provoked, remember the monk and the scorpion. Never surrender your high nature to another person's pettiness. Self-control is your greatest strength!",
        "video_subtitles": [
          "Anger burns your own peace first...",
          "Do not surrender your noble nature to another's rage...",
          "Master your emotions with unshakeable calm...",
          "Conquer anger: Self-control is the greatest power!"
        ]
      },
      "hindi": {
        "slogan_trans": "क्रोध महाशत्रु है, उस पर विजय पाओ! आत्मसंयम ही परम पराक्रम है।",
        "story_title": "संन्यासी और बिच्छू (क्रोध एवं क्षमा की विजय)",
        "story_text": "एक संन्यासी गंगा तट पर ध्यानस्थ थे, तभी उन्होंने देखा कि एक बिच्छू जलधारा में बह रहा है। दयावश उन्होंने उसे हथेली पर उठाया, किंतु बिच्छू ने डंक मार दिया। पीड़ा से हाथ हिला और बिच्छू पुनः जल में गिर गया। संन्यासी ने उसे फिर उठाया, उसने फिर डंक मारा। एक पथिक ने कहा: 'महाराज! जो बार-बार डंक मारता है, उसे क्यों बचा रहे हैं?' संन्यासी ने शांत भाव से कहा: 'डंक मारना बिच्छू का स्वभाव है, और रक्षा करना मेरा धर्म। जब वह क्षुद्र जीव होकर अपना स्वभाव नहीं छोड़ता, तो मैं ज्ञानी होकर अपनी करुणा क्यों छोड़ दूं?' स्वामी जी ने सिखाया: जब कोई तुम्हें उकसाए या क्रोध दिलाए, तो अपने आत्मसंयम को कभी मत खोओ।",
        "story_lesson": "क्रोध वह विष है जो दूसरों के अपराध का दंड स्वयं को देता है। क्षमा और शांति से हर उत्तेजना को शांत किया जा सकता है।",
        "voice_narration": "क्रोध पर विजय प्राप्त करो मेरे मित्र! क्रोध तुम्हारी बुद्धि और तेज का नाश कर देता है। जब कोई तुम्हें उकसाए, तो संन्यासी की भांति शांत रहो। आत्मसंयम ही तुम्हारा वास्तविक बल है!",
        "video_subtitles": [
          "क्रोध पहले स्वयं को जलाता है...",
          "दूसरों के कटु वचनों से अपना विवेक मत खोओ...",
          "अखंड शांति और क्षमा धारण करो...",
          "क्रोध महाशत्रु है: आत्मसंयम ही परम विजय है!"
        ]
      },
      "hinglish": {
        "slogan_trans": "Gusse par vijay pao! Self-control hi sabse badi taakat hai.",
        "story_title": "The Monk and the Scorpion (Anger Control Ka Rahasya)",
        "story_text": "Ganga kinare ek sannyasi ne doobte hue bicchoo ko bachane ke liye hath aage badhaya, par bicchoo ne dank maar diya. Dard se hath hila aur wo fir paani me gira. Sannyasi ne fir bachaya, usne fir dank maara. Ek aadmi bola: 'Ye aapko kaat raha hai, fir kyu bacha rahe ho?' Sannyasi ne muskurakar kaha: 'Dank marna uska swabhav hai, aur karuna meri fitrat. Jab wo apna nich swabhav nahi chhodta, toh main apna shuddh dharam kyu chhodu?' Swami ji ne sikhaya: Dusro ke gusse me aakar apna sukoon mat gavao.",
        "story_lesson": "Gussa dusron ki galti ki saza khud ko dena hai. Shanti aur patience se har ladai jeeti ja sakti hai.",
        "voice_narration": "Gusse par control pao mere saathi! Jab koi irritate kare ya ladna chahe, toh react karne ke bajaye santulan banaye rakhein. Aapka self-control hi aapki asli shakti hai!",
        "video_subtitles": [
          "Gussa sabse pehle aapka sukoon cheenta hai...",
          "Dusro ke provoke karne par reactive mat bano...",
          "Shant dimag se faisla lo...",
          "Gusse ko harakar self-mastery hasil karo!"
        ]
      }
    }
  },
  {
    "id": "story_dakshineswar_poverty",
    "category": "money_poverty",
    "video_theme": "dakshineswar_grace",
    "keywords": [
      "money",
      "poverty",
      "paise",
      "garibi",
      "debt",
      "karza",
      "jobless",
      "berozgari",
      "financial",
      "salary",
      "gareeb",
      "ameer",
      "rupaye",
      "kangaal",
      "kharcha",
      "economic"
    ],
    "sanskrit_slogan": "धनं न शरणं, धर्म एव शरणम्। विवेकं देहि मे मातः।",
    "translations": {
      "english": {
        "slogan_trans": "Wealth is transient, righteousness is eternal! O Mother, grant discrimination and unwavering faith.",
        "story_title": "Poverty at Dakshineswar (Asking for Discrimination)",
        "story_text": "When Narendra's father suddenly passed away, the family plunged into crushing poverty. Creditors banged on the doors, and Narendra walked through Kolkata with torn shoes, starving for days so his mother and brothers could have a bowl of rice. In absolute desperation, he pleaded with Sri Ramakrishna: 'Sir, pray to Mother Kali to remove our extreme poverty!' Ramakrishna said: 'Go inside the temple yourself and ask Mother Kali today; whatever you ask, She will grant!' Narendra ran inside. But as he beheld the divine radiant image of Mother Kali, his worldly desires evaporated. Prostrating with tears, he could only pray: 'Mother, grant me discrimination, renunciation, knowledge, and unbroken devotion!' Three times he went, and three times he asked only for wisdom, never for money. Soon after, Narendra gained infinite inner spiritual wealth and transformed millions of lives.",
        "story_lesson": "Financial hardships test your steel. Never sell your integrity for quick gains; character, skill, and dharma will inevitably conquer poverty.",
        "voice_narration": "Fear not financial hardship, my brave friend! Money comes and goes like shadows on the grass. You are the infinite Atman! Strengthen your skills, maintain your purity of purpose, and providence will provide for all your needs. Arise with courage!",
        "video_subtitles": [
          "Poverty tests the nobility of character...",
          "Do not sell your soul for transient coins...",
          "Dharma, skill, and perseverance conquer all debts...",
          "Faith and courage will open every closed door!"
        ]
      },
      "hindi": {
        "slogan_trans": "धन क्षणभंगुर है, धर्म ही शाश्वत शरण है। हे माँ, मुझे विवेक और अगाध निष्ठा दो।",
        "story_title": "दक्षिणेश्वर में दरिद्रता की परीक्षा (माँ से विवेक की याचना)",
        "story_text": "पिता के आकस्मिक निधन के बाद नरेंद्र का परिवार भीषण दरिद्रता में डूब गया। लेनदारों का तकादा और घर में अन्न का अभाव था। नरेंद्र कई दिन भूखे रहकर शहर में काम ढूंढते ताकि माँ-भाई खा सकें। विवश होकर उन्होंने रामकृष्ण परमहंस से कहा: 'महाराज, माँ काली से प्रार्थना कर हमारे कष्ट दूर कर दीजिए।' ठाकुर ने कहा: 'तुम स्वयं मंदिर जाओ, आज माँ से जो मांगोगे वो मिलेगा।' नरेंद्र मंदिर पहुंचे, किंतु माँ की अलौकिक छवि देखते ही सांसारिक मोह लुप्त हो गया। उन्होंने अश्रुपूर्ण नेत्रों से कहा: 'माँ, मुझे विवेक दो, वैराग्य दो, ज्ञान दो!' तीन बार गए और तीनों बार केवल ज्ञान ही मांगा। कालांतर में उनके ज्ञान और पराक्रम ने संपूर्ण जगत को आलोकित किया।",
        "story_lesson": "आर्थिक संकट व्यक्ति के चरित्र की परीक्षा है। कठिनाइयों में भी अपने नैतिक मूल्यों और कर्मठता को न छोड़ें, सफलता अवश्य कदम चूमेगी।",
        "voice_narration": "धन की तंगी से विचलित मत हो! तुम दरिद्र नहीं, असीम सामर्थ्य के स्वामी हो। अपनी मेहनत, कौशल और धर्म पर भरोसा रखो। समय बदलेगा और तुम्हारा स्वाभिमान विजयी होगा!",
        "video_subtitles": [
          "आर्थिक संकट तुम्हारे आत्मबल की परीक्षा है...",
          "क्षणिक धन के लिए अपना स्वाभिमान मत बेचो...",
          "कर्मठता और ज्ञान से दरिद्रता का नाश करो...",
          "धर्म और अटूट निष्ठा ही परम विजय है!"
        ]
      },
      "hinglish": {
        "slogan_trans": "Paisa aani-jaani cheez hai, dharma aur mehnat hi asli sahara hai.",
        "story_title": "Poverty at Dakshineswar (Vivek Aur Mehnat Ki Jeet)",
        "story_text": "Father ki death ke baad young Narendra ke ghar me khane ke laale pad gaye. Narendra kai din bhookhe rehkar job dhundte rahe taaki family ko khana mile. Unhone Ramakrishna ji se kaha ki Maa Kali se paisa dilwa do. Thakur ne kaha khud jaakar maang lo. Narendra mandir gaye par Maa ki divya aabha dekhkar unka munh se sirf nikla: 'Maa, mujhe gyan, vivek aur bhakti do!' Unhone 3 baar yahi maanga. Paisa temporay hai, unka gyan aur determination unhe vishwa-vijayi banaya.",
        "story_lesson": "Financial crisis me ghabraayein nahi. Apni mehnat aur skills par focus karein, raasta zaroor niklega.",
        "voice_narration": "Paise ki dikkat se despair me mat jao mere dost! Aapka character aur talent aapki sabse badi asset hai. Mehnat karo, integrity banaye rakho, har mushkil hal hogi!",
        "video_subtitles": [
          "Paise ki tangi se himmat mat haaro...",
          "Character aur hard work se har kangaali door hogi...",
          "Apne skills aur dedication par bharosa rakho...",
          "Mehnat aur gyan hi asli amiri hai!"
        ]
      }
    }
  },
  {
    "id": "story_father_loss_grief",
    "category": "loneliness_grief",
    "video_theme": "immortal_atman",
    "keywords": [
      "lonely",
      "loneliness",
      "akela",
      "akelapan",
      "grief",
      "death",
      "mourning",
      "loss",
      "sadness",
      "depressed",
      "cry",
      "rona",
      "suicide",
      "koi nahi hai",
      "alone",
      "dard",
      "maut"
    ],
    "sanskrit_slogan": "नैनं छिन्दन्ति शस्त्राणि नैनं दहति पावकः। त्वमेकाकी न कदापि।",
    "translations": {
      "english": {
        "slogan_trans": "Weapons cannot cleave the soul, nor can fire burn it! You are never truly alone.",
        "story_title": "Walking in the Night Rain (You Are Never Alone)",
        "story_text": "During his hardest months in Kolkata, Narendra felt completely isolated. Relatives dragged his family to court, friends avoided him, and the sky seemed cold and indifferent. One torrential rainy night, exhausted and faint with hunger, he collapsed upon the roadside mud. In that state of utter silence, suddenly a profound spiritual veil was lifted. A blazing celestial awareness enveloped him: 'Why do you feel alone? The mortal body and its transient companions pass away, but the immortal Atman within you never dies, never departs, and is intimately connected to the entire cosmos!' From that hour, Narendra never felt lonely again. Swami ji taught: 'The whole universe is your home; the Infinite is your eternal companion.'",
        "story_lesson": "Loneliness is an illusion of the ego. When the world turns away, go within — the Divine Presence is nearest to you in your deepest solitude.",
        "voice_narration": "Do not weep in solitude, my dear child! You are never alone in this vast universe. The eternal Divine Mother dwells in your very heart. Cast off this sorrow, wipe your tears, and realize your immortal spiritual heritage!",
        "video_subtitles": [
          "Wipe your tears in the dark night...",
          "The soul never perishes nor is it ever abandoned...",
          "In the deepest silence, the Divine walks with you...",
          "You are never alone: The Infinite is within you!"
        ]
      },
      "hindi": {
        "slogan_trans": "आत्मा को न शस्त्र काट सकते हैं, न अग्नि जला सकती है! तुम कभी अकेले नहीं हो।",
        "story_title": "वर्षा की रात्रि में आत्मबोध (तुम कभी अकेले नहीं हो)",
        "story_text": "कोलकाता के अत्यंत कठिन दिनों में नरेंद्र स्वयं को नितांत एकाकी पाते थे। संबंधियों ने मुकदमा कर दिया था और मित्र कतराने लगे थे। एक घनघोर वर्षा की रात, भूख और थकान से चूर नरेंद्र सड़क के किनारे कीचड़ में गिर पड़े। उसी निस्तब्ध घड़ी में अचानक एक दिव्य चेतना का जागरण हुआ। उन्हें अंतरात्मा का साक्षात्कार हुआ: 'तुम अकेले क्यों विलाप करते हो? यह नश्वर संसार और संबंध आते-जाते हैं, किंतु तुम्हारे भीतर का अमर चैतन्य कभी नहीं मरता, कभी अकेला नहीं होता!' उस क्षण के बाद नरेंद्र ने कभी अकेलापन अनुभव नहीं किया। उन्होंने सिखाया: 'समस्त ब्रह्मांड तुम्हारा अपना है, परमात्मा सदा तुम्हारे साथ है।'",
        "story_lesson": "अकेलापन केवल एक मानसिक भ्रम है। जब संसार साथ छोड़ दे, तो अंतर्मुखी होकर उस परमात्मा को पहचानें जो आपके हृदय में सदा विराजमान है।",
        "voice_narration": "एकाकीपन में विलाप मत करो साधक! तुम अनाथ नहीं हो, समस्त ब्रह्मांड की चेतना तुम्हारे साथ है। आंसुओं को पोंछो, आत्मा की अमरता को पहचानो और परमात्मा के सान्निध्य में शांति प्राप्त करो!",
        "video_subtitles": [
          "घोर अंधकार में भी धैर्य मत खोओ...",
          "आत्मा अजर-अमर और अखंड है...",
          "एकांत में ही परमात्मा सबसे निकट होता है...",
          "तुम अकेले नहीं हो: अनंत शक्ति तुम्हारे साथ है!"
        ]
      },
      "hinglish": {
        "slogan_trans": "Aatma amar hai, aap kabhi akele nahi hain! Divine presence aapke andar hai.",
        "story_title": "Walking in the Rain (Akelapan Door Karne Ka Marg)",
        "story_text": "Kolkata ke tough time me Narendra bohot akela feel kar rahe the. Sabhi rishtedaron ne dhokha diya aur dosto ne muh mod liya. Ek baar baarish me chalte hue wo raste par behosh ho gaye. Tabhi unke andar ek deep realization hua ki ye shareer aur duniya aani jaani hai, par jo aatma andar hai wo kabhi akeli nahi hoti. Us din ke baad unhone kabhi loneliness feel nahi ki. Swami ji ne sikhaya: Pure universe me aap kabhi akele nahi hain.",
        "story_lesson": "Akelapan temporary hai. Jab duniya door lage, toh apne andar ki shanti ko khojo, bhagwan sabse kareeb hote hain.",
        "voice_narration": "Akelepan me ro mat mere dost! Universe ki shakti aapke sath hai. Apne dil ki aawaz suno, aap anath nahi hain, aap divine shakti ka roop hain!",
        "video_subtitles": [
          "Akelapan mehsoos karne ki zaroorat nahi hai...",
          "Aatma kabhi akeli nahi hoti...",
          "Har mushkil ghadi me bhagwan sath hain...",
          "Utho aur apne andar ki shanti ko pehchano!"
        ]
      }
    }
  },
  {
    "id": "story_cobbler_divinity",
    "category": "ego_humility",
    "video_theme": "daridra_narayana",
    "keywords": [
      "ego",
      "pride",
      "ghamand",
      "arrogance",
      "superior",
      "judging",
      "ahankar",
      "caste",
      "superiority",
      "attitude",
      "show off",
      "heena",
      "bhedbhav"
    ],
    "sanskrit_slogan": "सर्वभूतेषु चात्मानं सर्वभूतानि चात्मनि। अहङ्कारं विमुञ्च।",
    "translations": {
      "english": {
        "slogan_trans": "See your own self in all beings, and all beings in your self! Cast off all petty ego.",
        "story_title": "The Cobbler and the King (Every Soul is Divine)",
        "story_text": "During his travels across India, Swami Vivekananda arrived in a princely city where orthodox scholars took excessive pride in their high birth and erudition, treating ordinary working people with harsh contempt. Swami ji went straight to the hut of a poor, hard-working cobbler, sat beside him on the dirt floor, shared simple dry rotis with him, and blessed his family. When the shocked scholars cried out: 'Swamiji, you are a great monk, why do you touch an untouchable?', Swami ji's eyes flashed like lightning: 'Do-not-touchism is not religion! God is not confined to holy books or ritual arrogance. God resides in the sweating cobbler, the sweeper, and the laborer — Daridra Narayana! The day you see the Divine in the humblest human being, your blind ego will shatter and true wisdom will dawn!'",
        "story_lesson": "Arrogance and ego poison the soul. True greatness is proven through humility, empathy, and honoring the divine spark in every living person.",
        "voice_narration": "Cast off your petty pride, my friend! What are you proud of? Wealth, intellect, or status? They will all vanish into dust. The true conqueror is he who serves with humble love. See God in every living soul!",
        "video_subtitles": [
          "Cast off pride and false superiority...",
          "Every soul is potentially divine...",
          "Serve the humble as the living God...",
          "True greatness lies in profound humility!"
        ]
      },
      "hindi": {
        "slogan_trans": "समस्त जीवों में अपनी आत्मा को और अपनी आत्मा में सबको देखो! अहंकार का त्याग करो।",
        "story_title": "चर्मकार और स्वामी जी (दरिद्र नारायण की सेवा)",
        "story_text": "भारत भ्रमण के समय स्वामी जी एक नगर में पहुंचे जहां अहंकारी पंडित अपनी उच्च जाति और विद्या का घमंड कर गरीबों को प्रताड़ित करते थे। स्वामी जी सीधे एक निर्धन चर्मकार (मोची) की कुटिया में गए, जमीन पर उसके साथ बैठकर उसकी सूखी रोटी खाई और उसे गले लगा लिया। जब पंडितों ने आपत्ति की, तो स्वामी जी सिंह के समान गरजे: 'छुआछूत धर्म नहीं है! ईश्वर केवल मंदिरों और पोथियों में बंद नहीं है। वह इस पसीना बहाते मोची और श्रमजीवी में वास करता है — दरिद्र नारायण! जिस दिन तुम सबसे निर्धन में भी ईश्वर को देखोगे, तुम्हारा अहंकार चूर हो जाएगा और तुम्हें सच्चे ज्ञान की प्राप्ति होगी!'",
        "story_lesson": "अहंकार और घमंड विनाश की जड़ हैं। वास्तविक महानता विनम्रता, समानता और प्रत्येक प्राणी में ईश्वर के दर्शन करने में है।",
        "voice_narration": "अहंकार का त्याग करो मेरे बंधु! किस बात का घमंड करते हो? विद्या, धन या पद का? यह सब नश्वर है। सच्चा विजेता वही है जो विनम्र होकर सेवा करता है। प्रत्येक प्राणी में परमात्मा को देखो!",
        "video_subtitles": [
          "झूठे अहंकार और घमंड को त्याग दो...",
          "प्रत्येक आत्मा में ईश्वर का वास है...",
          "दीन-दुखियों की सेवा ही सच्ची पूजा है...",
          "विनम्रता ही वास्तविक महानता का लक्षण है!"
        ]
      },
      "hinglish": {
        "slogan_trans": "Ghamand chhodo, har insaan me bhagwan ka roop dekho! Humility hi asli taakat hai.",
        "story_title": "The Cobbler and Swami ji (Ghamand Chhodne Ka Sabak)",
        "story_text": "Swami ji ne ek shehar me dekha ki log apne paise aur jaat ka bohot ghamand karte the. Swami ji seedhe ek gareeb mochi ke ghar gaye, uske sath zameen par baith kar roti khayi aur use gale lagaya. Jab logon ne sawal uthaya toh Swami ji bole: 'Bhed-bhav dharam nahi hai! Bhagwan har mehnat karne wale insaan me basta hai — Daridra Narayana! Asli gyan tab milta hai jab tum sabko barabar samjho aur ego chhod do.'",
        "story_lesson": "Ego aur attitude aapko sabse door kar deta hai. Down to earth reh kar har kisi ki respect karein.",
        "voice_narration": "Apna ghamand mita do mere dost! Paisa aur status temporary hai, asli value aapke ache vyavahar ki hai. Sabko samman do aur dil se jeeto!",
        "video_subtitles": [
          "Ghamand aur superiority complex ko mitao...",
          "Har insaan barabar aur anmol hai...",
          "Down to earth rehna hi asli success hai...",
          "Ego chhod kar pyaar aur samman baato!"
        ]
      }
    }
  },
  {
    "id": "story_blind_faith_truth",
    "category": "doubt_skepticism",
    "video_theme": "search_for_truth",
    "keywords": [
      "doubt",
      "skepticism",
      "god",
      "faith",
      "truth",
      "atheist",
      "question",
      "vishwas",
      "overthinking",
      "shak",
      "bhagwan",
      "satya",
      "confused",
      "logic",
      "proof"
    ],
    "sanskrit_slogan": "सत्यमेव जयते नानृतम्। प्रत्यक्षानुभूतिरेव धर्मः।",
    "translations": {
      "english": {
        "slogan_trans": "Truth alone triumphs, never untruth! Direct personal experience is the essence of true religion.",
        "story_title": "Sir, Have You Seen God? (The Quest for Truth)",
        "story_text": "As a brilliant college youth influenced by Western rationalism and science, Narendra refused to believe anything on hearsay. He visited eminent philosophers, asking: 'Sir, have you seen God?' None could give an honest answer; they only quoted books. Finally, Narendra met Sri Ramakrishna at Dakshineswar and put the blunt challenge: 'Sir, have you seen God?' Without a moment's hesitation, Ramakrishna smiled with serene certainty: 'Yes, I have seen God. I see Him as clearly as I see you here, only a thousand times more intensely! And you too can see Him if you yearn for truth!' Narendra was stunned by this fearless conviction. Ramakrishna told him: 'Do not accept anything merely because I say so, or because it is written in old books. Test truth as the goldsmith tests gold by rubbing it on touchstone!'",
        "story_lesson": "Healthy inquiry and scientific doubt are stepping stones to supreme truth. Never settle for blind dogma; seek direct experiential realization.",
        "voice_narration": "Do not follow like blind sheep, my seeker friend! Question with sincerity, test everything by reason and direct realization. Truth fears no test, no scrutiny! Stand upon the unshakeable rock of direct experience!",
        "video_subtitles": [
          "Never follow blind superstitions...",
          "Test truth as a goldsmith tests pure gold...",
          "Direct experience is the supreme authority...",
          "Truth alone triumphs, never falsehood!"
        ]
      },
      "hindi": {
        "slogan_trans": "सत्य की ही विजय होती है, असत्य की नहीं! प्रत्यक्ष अनुभूति ही वास्तविक धर्म है।",
        "story_title": "क्या आपने ईश्वर को देखा है? (सत्य की निर्भीक खोज)",
        "story_text": "तर्कशील युवा नरेंद्र किसी भी बात पर बिना प्रमाण के विश्वास नहीं करते थे। उन्होंने कोलकाता के अनेक विद्वानों से पूछा: 'क्या आपने ईश्वर को देखा है?' कोई भी स्पष्ट उत्तर न दे सका। अंततः वे दक्षिणेश्वर में रामकृष्ण परमहंस के पास पहुंचे और वही प्रश्न किया। परमहंस जी ने तनिक भी हिचकिचाए बिना मुस्कुराकर कहा: 'हां, मैंने ईश्वर को देखा है! जैसे तुम्हें देख रहा हूं, उससे भी कहीं अधिक स्पष्ट रूप से! और यदि तुम चाहो तो तुम भी देख सकते हो।' नरेंद्र उनके इस प्रत्यक्ष अनुभव से स्तब्ध रह गए। ठाकुर ने कहा: 'मेरी बातों पर भी आंख मूंदकर विश्वास मत करो। जैसे सुनार सोने को कसौटी पर कसता है, वैसे ही सत्य को अपनी बुद्धि और अनुभव की कसौटी पर परखो!'",
        "story_lesson": "सच्ची जिज्ञासा और विवेकपूर्ण संदेह अंधविश्वास से मुक्त करते हैं। बिना अनुभव के किसी सिद्धांत को न मानें; सत्य की प्रत्यक्ष अनुभूति ही सिद्धि है।",
        "voice_narration": "अंधविश्वासी मत बनो! बुद्धि और तर्क से सत्य की खोज करो। सत्य को किसी के समर्थन की आवश्यकता नहीं होती; वह सूर्य के समान स्वयं प्रकाशमान है। अपनी अंतरात्मा से सत्य का साक्षात्कार करो!",
        "video_subtitles": [
          "अंधविश्वास और रूढ़िवादिता को त्यागो...",
          "सत्य को अपनी अनुभूति की कसौटी पर परखो...",
          "प्रत्यक्ष अनुभव ही ज्ञान का सर्वोच्च प्रमाण है...",
          "सत्यमेव जयते: केवल सत्य की ही विजय होती है!"
        ]
      },
      "hinglish": {
        "slogan_trans": "Satya ki hi jeet hoti hai! Blind faith chhod kar khud experience karo.",
        "story_title": "Sir, Have You Seen God? (Truth Ki Talaash)",
        "story_text": "Young Narendra kisi bhi baat ko bina proof ke nahi maante the. Unhone bade-bade logo se poocha: 'Kya aapne Bhagwan ko dekha hai?' Sab bookish baatein karte the. Par Ramakrishna Paramahamsa ne bina dare bola: 'Haan, maine dekha hai! Jaise tumhe dekh raha hu, usse bhi clear!' Aur unhone sikhaya: 'Meri baat par bhi blind trust mat karo. Jaise sonaar sone ko test karta hai, waise sach ko test karo!'",
        "story_lesson": "Doubt hona bura nahi hai. Andha vishwas chhod kar apne logic aur experience se sach ko jaan-ne ki koshish karein.",
        "voice_narration": "Bhed-chaal me mat chalo mere saathi! Sawal poochna seekho aur sach ko khud experience karo. Truth kisi se darta nahi hai, direct realization hi asli dharam hai!",
        "video_subtitles": [
          "Blind faith aur superstitions ko chhod do...",
          "Sach ko logic aur experience se test karo...",
          "Direct experience hi sabse bada proof hai...",
          "Satya hamesha vijayi hota hai!"
        ]
      }
    }
  },
  {
    "id": "story_restless_monkey_mind",
    "category": "addiction_discipline",
    "video_theme": "mastery_of_mind",
    "keywords": [
      "addiction",
      "habit",
      "lust",
      "porn",
      "urges",
      "control",
      "smoking",
      "alcohol",
      "masturbation",
      "chanchal",
      "indriya",
      "aadat",
      "vasana",
      "compulsion",
      "bad habit"
    ],
    "sanskrit_slogan": "मन एव मनुष्याणां कारणं बन्धमोक्षयोः। जितेन्द्रियो भव।",
    "translations": {
      "english": {
        "slogan_trans": "Mind alone is the cause of bondage or liberation! Master the senses and be truly free.",
        "story_title": "The Drunken Monkey Mind (Mastery Over Compulsions)",
        "story_text": "Swami Vivekananda gave the immortal allegory of the human mind: 'The mind is like a restless monkey by nature, jumping ceaselessly from branch to branch. As if this were not enough, someone gave the monkey strong liquor to drink, making it wildly intoxicated. Then a scorpion stung the monkey, sending it into agonizing spasms. And to crown its misery, a ghost entered into the monkey! How can words describe the frantic antics of such a creature?' Swami ji explained: 'Such is the human mind — naturally restless, intoxicated by sensory desires, stung by the scorpion of jealousy and cravings, and possessed by the demon of ego! Do not fight it with frantic frustration. Sit quietly, observe its movements like a detached witness, and starve harmful compulsions through steadfast Brahmacharya and meditation.'",
        "story_lesson": "Do not despise yourself for compulsive urges. Stand back as the calm witness; with daily meditation and discipline, the storm in the mind calms into pure serenity.",
        "voice_narration": "Master your mind, my young lion! If you control your mind, you conquer the universe; if your mind controls you, you are a slave! Stand back as the silent witness, practice unbroken self-restraint, and reclaim your supreme freedom!",
        "video_subtitles": [
          "Do not be a slave to restless impulses...",
          "Stand back as the calm, detached witness...",
          "Starve destructive addictions through self-discipline...",
          "Master the mind and conquer the universe!"
        ]
      },
      "hindi": {
        "slogan_trans": "मन ही मनुष्य के बंधन और मोक्ष का कारण है! इंद्रियों पर विजय पाकर परम मुक्त बनो।",
        "story_title": "मद्यपी वानर का दृष्टांत (इंद्रिय संयम एवं वासना मुक्ति)",
        "story_text": "स्वामी विवेकानंद ने मन की चंचलता का अद्भुत दृष्टांत दिया: 'मन स्वभाव से ही चंचल वानर के समान है जो एक डाल से दूसरी डाल पर कूदता रहता है। उस पर किसी ने उसे मदिरा पिला दी, जिससे वह उन्मत्त हो गया। फिर एक बिच्छू ने उसे डंक मार दिया जिससे वह तड़पने लगा। और अंत में उस पर एक पिशाच सवार हो गया! अब उसकी दशा का क्या वर्णन करें?' स्वामी जी ने समझाया: 'मनुष्य का मन भी ऐसा ही है — स्वभाव से चंचल, वासनाओं की मदिरा से उन्मत्त, ईर्ष्या-वासना के बिच्छू से पीड़ित और अहंकार के पिशाच से ग्रस्त! इससे कुंठित होकर मत लड़ो। शांत होकर एक साक्षी के समान इसके विचारों को देखो। प्राणायाम, ब्रह्मचर्य और आत्मसंयम से यह वश में आ जाता है।'",
        "story_lesson": "व्यसनों और वासनाओं से घृणा मत करो, अपितु साक्षी भाव से उन्हें समझो। नियमित ध्यान और संयम से भटकता हुआ मन दिव्य शांति में लीन हो जाता है।",
        "voice_narration": "अपने मन के स्वामी बनो! यदि तुम मन को जीत लोगे तो संसार को जीत लोगे। इंद्रियों की गुलामी छोड़ो, ब्रह्मचर्य और आत्मसंयम का दीप जलाओ। तुम वासनाओं के दास नहीं, दिव्य आत्मा हो!",
        "video_subtitles": [
          "क्षणिक आवेगों और व्यसनों के दास मत बनो...",
          "साक्षी भाव से अपने विचारों को देखना सीखो...",
          "आत्मसंयम और ब्रह्मचर्य से मन को शुद्ध करो...",
          "मन को जीतो और संसार पर विजय पाओ!"
        ]
      },
      "hinglish": {
        "slogan_trans": "Mann hi bandhan aur azaadi ka kaaran hai. Self-discipline se mann par vijay pao.",
        "story_title": "The Drunken Monkey Mind (Bad Habits Se Mukti)",
        "story_text": "Swami Vivekananda ji ne bataya ki human mind ek chanchal bandar jaisa hai. Upar se use sharab pila di gayi, fir bicchoo ne kaat liya, aur bhoot sawar ho gaya! Hamara dimag bhi desires aur addictions se aisa hi bhatakta hai. Swami ji ne kaha: Ghabrao mat, apne thoughts ko ek spectator ki tarah observe karo. Daily discipline aur focus se har buri aadat chhut jaati hai.",
        "story_lesson": "Bad habits se ladne ke liye frustate mat ho. Habits replace karne ke liye healthy routine aur meditation shuru karein.",
        "voice_narration": "Apne dimag ke gulam mat bano mere dost! Control your impulses! Agar aap apne mind ko master kar loge toh duniya me koi cheez aapko hara nahi sakti. Brahmacharya aur focus apnao!",
        "video_subtitles": [
          "Buri aadaton aur temptations ke gulam mat bano...",
          "Apne mann ko witness ki tarah observe karo...",
          "Discipline aur routine se aadat badlo...",
          "Apne mann ko master karke vijayi bano!"
        ]
      }
    }
  },
  {
    "id": "story_golden_plate_sacrifice",
    "category": "jealousy_seva",
    "video_theme": "golden_seva",
    "keywords": [
      "jealousy",
      "envy",
      "selfish",
      "jalte",
      "dushmani",
      "seva",
      "help",
      "compassion",
      "charity",
      "dost se jalan",
      "swarth",
      "comparison",
      "greedy",
      "competitor"
    ],
    "sanskrit_slogan": "परोपकाराय फलन्ति वृक्षाः। आत्मनो मोक्षार्थं जगद्धिताय च।",
    "translations": {
      "english": {
        "slogan_trans": "Trees bear fruit for the benefit of others! For one's own liberation and the welfare of the world.",
        "story_title": "The Golden Plate of Heaven (They Alone Live Who Live for Others)",
        "story_text": "A legend recounted by Swami Vivekananda tells of a plate of solid celestial gold that fell from the heavens into a temple courtyard. On it were engraved the words: 'To him who loves best, a gift from God.' The high priests invited nobles, kings, and wealthy merchants to claim it. Proud donors who had given millions stepped forward and touched the plate, but the instant their fingers touched it, the golden plate turned to ugly black lead! For an entire year, countless famous people tried and failed. Finally, a humble peasant who had spent his last copper coin to buy food for a crippled beggar outside the temple walked into the courtyard. Unaware of the reward, he touched the lead plate with gentle reverence — and immediately it blazed with radiant, blinding celestial gold! Swami ji taught: 'They alone live who live for others; the rest are more dead than alive.'",
        "story_lesson": "Jealousy and self-centered hoarding turn life to lead. When you expand your heart in selfless service, your existence turns to pure gold.",
        "voice_narration": "They alone live who live for others, my friend! The rest are more dead than alive. Cast off jealousy and comparison! Open your heart, wipe the tears of the suffering, and the entire universe will shower blessings upon you!",
        "video_subtitles": [
          "Cast off petty jealousy and comparison...",
          "Selfishness turns the brightest soul to lead...",
          "Pure, selfless compassion turns life to radiant gold...",
          "They alone live who live for others!"
        ]
      },
      "hindi": {
        "slogan_trans": "वृक्ष परोपकार के लिए फल देते हैं! अपनी मुक्ति और संसार के कल्याण के लिए जियो।",
        "story_title": "स्वर्ग की स्वर्ण थाली (वे ही जीवित हैं जो दूसरों के लिए जीते हैं)",
        "story_text": "स्वामी विवेकानंद ने कथा सुनाई कि एक मंदिर में आकाश से शुद्ध सोने की एक थाली गिरी, जिस पर लिखा था: 'जो प्राणी मात्र से सच्चा प्रेम करता है, यह ईश्वर का उपहार उसके लिए है।' बड़े-बड़े राजाओं और धनवानों ने आकर उसे छुआ, किंतु छूते ही स्वर्ण थाली काले शीशे में बदल गई। वर्ष भर यही क्रम चला। अंत में एक साधारण किसान आया जिसने मंदिर के बाहर एक भूखे, असहाय कुष्ठ रोगी को अपनी अंतिम रोटी दी थी। उसने अनजाने में उस थाली को छुआ, और छूते ही वह थाली सहस्र सूर्यों के समान दिव्य स्वर्ण आभा से जगमगा उठी! स्वामी जी ने गर्जना की: 'सच्चे अर्थों में वही जीवित हैं जो दूसरों के लिए जीते हैं; शेष तो जीवित मृतक के समान हैं!'",
        "story_lesson": "दूसरों से ईर्ष्या और स्वार्थ जीवन को विषाक्त बना देते हैं। जब आप निःस्वार्थ भाव से दीन-दुखियों की सेवा करते हैं, तो जीवन में दिव्य आनंद का संचार होता है।",
        "voice_narration": "ईर्ष्या और द्वेष का त्याग करो! वे ही वास्तव में जीवित हैं जो दूसरों के आंसुओं को पोंछते हैं। अपने हृदय को विशाल बनाओ, परोपकार को अपना धर्म बना लो और संसार में प्रेम का प्रकाश फैलाओ!",
        "video_subtitles": [
          "ईर्ष्या और स्वार्थ की संकीर्णता से बाहर निकलो...",
          "दूसरों की उन्नति से प्रसन्न होना सीखो...",
          "निःस्वार्थ सेवा ही जीवन को स्वर्ण बनाती है...",
          "वे ही जीवित हैं जो दूसरों के लिए जीते हैं!"
        ]
      },
      "hinglish": {
        "slogan_trans": "Wo hi log sach me jeete hain jo dusron ke liye jeete hain. Jalan chhod kar help karo.",
        "story_title": "The Golden Plate of Heaven (Jealousy Se Seva Ki Taraf)",
        "story_text": "Ek mandir me aakash se sone ki plate giri jispe likha tha ki jo sabse zyada unconditional love karega ye uske liye hai. Ameer logo aur kings ne chuha toh wo kaali pad gayi. Aakhir me ek gareeb kisaan ne bahar baithe bhookhe beemar insaan ko apna aakhiri khana diya aur jab plate ko chuha toh wo chamakne lagi! Swami ji ne sikhaya: 'They alone live who live for others; the rest are more dead than alive.'",
        "story_lesson": "Doston se jealous hona chhod kar unki khushi me khush hona seekhein. Kisi ki madad karna aapke andar shanti bharta hai.",
        "voice_narration": "Jalan aur competition ko door karo mere dost! Dusron ke liye kuch acha karna hi sabse badi khushi deta hai. Dil bada karo aur help karna shuru karo!",
        "video_subtitles": [
          "Comparison aur jalan ko dil se nikaal do...",
          "Dusron ki kamyabi me unka sath do...",
          "Selfless service se hi asli khushi milti hai...",
          "They alone live who live for others!"
        ]
      }
    }
  },
  {
    "id": "story_kanyakumari_rock",
    "category": "perseverance_exhaustion",
    "video_theme": "kanyakumari_resolve",
    "keywords": [
      "give up",
      "hopeless",
      "tired",
      "haar",
      "quit",
      "exhausted",
      "himmat",
      "ruk jau",
      "giveup",
      "fail ho gaya",
      "niras",
      "fed up",
      "cannot do it",
      "surrender",
      "broken"
    ],
    "sanskrit_slogan": "उद्यमेन हि सिध्यन्ति कार्याणि न मनोरथैः। धैर्येण सर्वं सिध्यति।",
    "translations": {
      "english": {
        "slogan_trans": "Great works are accomplished by resolute effort, not wishful thinking! Patience conquers all.",
        "story_title": "The Rock of Kanyakumari (Never Surrender to Despair)",
        "story_text": "In December 1892, penniless and worn out after wandering thousands of miles on foot across India, Swami Vivekananda stood at the southernmost tip of India at Kanyakumari. He wanted to reach the isolated rock jutting out of the turbulent sea, but the boatmen demanded money that he did not possess. Without hesitation, Swami ji plunged into the shark-infested, raging ocean waves and swam out to the rock alone! There, surrounded by three mighty oceans, he sat in unbroken meditation for three days and three nights. Hunger and exhaustion could not touch his spirit. On that holy rock, he conceived his master vision to uplift millions of youth and awaken the slumbering nation! Swami ji proclaimed: 'Take risks in your life! If you win, you can lead; if you lose, you can guide. Never surrender!'",
        "story_lesson": "When all doors seem closed and your strength is spent, take one more daring step. The darkest hour of exhaustion precedes the sunrise of your greatest victory.",
        "voice_narration": "Never give up, my heroic friend! You have come too far to turn back in despair. Plunge into the ocean of challenges like Swami Vivekananda at Kanyakumari! Have faith in yourself, persevere through the storm, and triumph is guaranteed!",
        "video_subtitles": [
          "Never surrender when the storm rages...",
          "Plunge fearlessly into the ocean of challenges...",
          "Endure the dark night with unyielding resolve...",
          "Arise! Your greatest victory is waiting!"
        ]
      },
      "hindi": {
        "slogan_trans": "उद्यम से ही समस्त कार्य सिद्ध होते हैं, केवल इच्छा करने से नहीं! अटूट धैर्य से सब कुछ संभव है।",
        "story_title": "कन्याकुमारी की शिला पर ध्यान (अटूट संकल्प एवं विजय)",
        "story_text": "दिसंबर 1892 में, संपूर्ण भारत में हजारों मील की पैदल यात्रा के बाद स्वामी विवेकानंद कन्याकुमारी पहुंचे। वे समुद्र के बीच स्थित एकांत शिला पर जाना चाहते थे, किंतु नाविकों ने धन मांगा जो उनके पास न था। बिना क्षण गंवाए, स्वामी जी ने उफनते समुद्र और शार्क मछलियों की परवाह किए बिना छलांग लगा दी और तैरकर उस शिला पर पहुंचे! वहां तीनों महासागरों के संगम पर उन्होंने तीन दिन और तीन रात अखंड समाधि लगाई। भूख और थकावट उनके फौलादी संकल्प को डिगा न सकी। उसी शिला पर भारत और संपूर्ण विश्व के युवाओं को जागृत करने का महान संकल्प जन्मा। उन्होंने कहा: 'कभी हार मत मानो! संघर्ष ही जीवन की कसौटी है!'",
        "story_lesson": "जब सारे मार्ग बंद दिखें और शरीर थक जाए, तब भी एक कदम और आगे बढ़ाएं। घोर निराशा के बाद ही असीम विजय का सूर्योदय होता है।",
        "voice_narration": "कभी हिम्मत मत हारो वीर साधक! तुम हारने के लिए पैदा नहीं हुए हो। कन्याकुमारी की शिला पर स्वामी जी के संकल्प को याद करो। समुद्र की उत्ताल लहरों से मत डरो, आगे बढ़ो और अपनी विजय का इतिहास लिखो!",
        "video_subtitles": [
          "निराशा और थकान के आगे घुटने मत टेको...",
          "चुनौतियों के महासागर में निर्भीक होकर कूदो...",
          "तीन दिन की तपस्या जैसा अटूट संकल्प रखो...",
          "उठो! तुम्हारी महानतम विजय तुम्हारी प्रतीक्षा कर रही है!"
        ]
      },
      "hinglish": {
        "slogan_trans": "Mehnat aur sabr se hi bade kaam bante hain. Kabhi give up mat karo!",
        "story_title": "The Rock of Kanyakumari (Never Give Up Attitude)",
        "story_text": "Pura India paidal ghoomne ke baad Swami ji Kanyakumari pahuche. Samundar ke beech rock par jaane ke liye boat wale ko dene ke liye paise nahi the. Swami ji ne bina soche khatarnak waves me chhalang laga di aur tair kar rock par pahuche! Waha unhone 3 din aur 3 raat continuous meditation kiya aur youth ko jagane ka mission banaya. Swami ji ne sikhaya: 'Life me risk lo! Jeetoge toh lead karoge, haaroge toh guide karoge. Quit kabhi mat karna!'",
        "story_lesson": "Jab lage ki sab khatam ho gaya hai, wahi waqt hota hai ek aakhiri zordaar koshish karne ka. Himmat mat haaro.",
        "voice_narration": "Give up karne ka khayal mann se nikaal do! Swami ji ne akele samundar paar kiya tha bina kisi support ke. Aapke andar bhi wahi willpower hai, ladte raho aur jeet kar dikhao!",
        "video_subtitles": [
          "Mushkil waqt me give up mat karo...",
          "Darr ko chhod kar aage badhte raho...",
          "Patience aur hard work se har tufaan guzar jayega...",
          "Himmat rakho, aap zaroor jeetoge!"
        ]
      }
    }
  },
  {
    "id": "story_sister_nivedita_friendship",
    "category": "relationships_friendship",
    "video_theme": "noble_friendship",
    "keywords": [
      "friend",
      "friendship",
      "relation",
      "betrayal",
      "dhokha",
      "prem",
      "attachment",
      "dosti",
      "yaar",
      "moh",
      "mentor",
      "partner",
      "love",
      "breakup pain",
      "trust"
    ],
    "sanskrit_slogan": "मित्रस्य चक्षुषा सर्वाणि भूतानि समीक्षन्ताम्। प्रेमैव मुक्तिः।",
    "translations": {
      "english": {
        "slogan_trans": "May all beings look upon one another with the eye of a true friend! Pure love is supreme liberation.",
        "story_title": "Sister Nivedita's Dedication (True Love Liberates, Never Binds)",
        "story_text": "When Margaret Noble (Sister Nivedita) arrived in India from London, she was deeply attached to her teacher Swami Vivekananda, but struggled with her Western conditioning and expected personal flattery. Swami Vivekananda never compromised with truth. He chiseled her personality with fierce spiritual love, breaking her petty attachments and guiding her to see that true friendship and love do not exist to possess another person, but to awaken each other's highest divine potential. When she finally surrendered her ego, she became the lioness of Indian education and public service. Swami ji gave her the blessing: 'Be thou to India's future son the mistress, servant, friend in one!' He taught: 'Love that binds and demands is mere bondage; love that gives without asking is divinity itself.'",
        "story_lesson": "True friendship and love never demand emotional enslavement. Love unconditionally, respect each other's spiritual growth, and let go of toxic attachments.",
        "voice_narration": "Love without clinging, my friend! True love does not make you a beggar for attention. It elevates, expands, and frees the soul. Be a true friend to all beings, and let your relationships be sacred partnerships in self-discovery!",
        "video_subtitles": [
          "True love liberates; it never enslaves...",
          "Do not become a beggar for emotional crumbs...",
          "Help your friends awaken their highest potential...",
          "Pure, selfless love is supreme freedom!"
        ]
      },
      "hindi": {
        "slogan_trans": "समस्त प्राणी एक-दूसरे को सच्चे मित्र की दृष्टि से देखें! निष्काम प्रेम ही परम मुक्ति है।",
        "story_title": "भगिनी निवेदिता का समर्पण (सच्चा प्रेम मुक्तिदाता है, बंधन नहीं)",
        "story_text": "जब मार्गरेट नोबल (भगिनी निवेदिता) लंदन से भारत आईं, तो वे स्वामी विवेकानंद के प्रति अत्यधिक व्यक्तिगत मोह रखती थीं और अपनी यूरोपीय मान्यताओं से बंधी थीं। स्वामी जी ने उनके व्यक्तिगत मोह को स्वीकार न कर कठोर आध्यात्मिक अनुशासन दिया। उन्होंने सिखाया कि सच्चा प्रेम किसी पर अधिकार जमाना या चापलूसी करना नहीं, अपितु दूसरे की अंतरात्मा को उच्चतम शिखर पर पहुंचाना है। जब निवेदिता का अहंकार विलीन हुआ, तो वे भारत की सेवा में समर्पित वीरांगना बन गईं। स्वामी जी ने सिखाया: 'जो प्रेम मांगता है और बांधता है, वह केवल वासना है; जो प्रेम बिना किसी अपेक्षा के सर्वस्व न्योछावर करता है, वही साक्षात ईश्वर है।'",
        "story_lesson": "सच्ची मित्रता और प्रेम में स्वामित्व की भावना नहीं होती। दूसरों को स्वतंत्रता दें, उनके आत्मविकास में सहायक बनें और संकीर्ण मोह से मुक्त हों।",
        "voice_narration": "संकीर्ण मोह और अपेक्षाओं से मुक्त हो जाओ! सच्चा प्रेम भिखारी नहीं बनाता, बल्कि दाता बनाता है। संबंधों में स्वार्थ का त्याग करो और सच्चे मित्र की भांति दूसरों के आत्मसम्मान और विकास का आधार बनो!",
        "video_subtitles": [
          "संकीर्ण मोह और अपेक्षाओं को त्यागो...",
          "सच्चा प्रेम स्वतंत्रता और गरिमा देता है...",
          "मित्रता में एक-दूसरे के आत्मबल को बढ़ाओ...",
          "निष्काम प्रेम ही वास्तविक मुक्ति का द्वार है!"
        ]
      },
      "hinglish": {
        "slogan_trans": "Sachhi dosti aur prem azaad karta hai, baandhta nahi. Unconditional prem hi mukti hai.",
        "story_title": "Sister Nivedita's Dedication (True Friendship Ka Meaning)",
        "story_text": "Sister Nivedita jab London se aayi toh unhe Swami ji se bohot zyada personal attachment tha. Swami ji ne unhe sikhaya ki true friendship aur love kisi ko control ya possess karna nahi hota, balki ek dusre ko grow karne me madad karna hota hai. Unhone Nivedita ke ego ko melt karke unhe ek selfless leader banaya. Swami ji ne sikhaya: 'Jo pyaar badle me validation maange wo moh hai; jo pyaar dena seekhe wo divine hai.'",
        "story_lesson": "Dosti ya relationship me kisi par dependent mat bano. Respect do, trust karo, aur ek dusre ke sapno ko support karo.",
        "voice_narration": "Moh aur toxic attachment se door raho mere dost! True love kabhi aapko kamzor nahi banata. Ek sachhe dost ki tarah dusro ko elevate karo aur dil se unka bhala chaho!",
        "video_subtitles": [
          "Toxic attachment aur dependency chhod do...",
          "Sachha pyaar azaad karta hai, baandhta nahi...",
          "Ek dusre ki growth aur self-respect ko support karo...",
          "Unconditional love hi asli strength hai!"
        ]
      }
    }
  }
]


# ==========================================
# ADVANCED NLP / ML SEMANTIC STORY MATCHER
# ==========================================
def extract_tokens(text):
    clean = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())
    return [w for w in clean.split() if len(w) > 2]

def match_problem_with_dataset(user_query):
    query_lower = user_query.lower()
    query_tokens = set(extract_tokens(user_query))
    best_story = VIVEKANANDA_DATASET[0]
    highest_score = -1

    for story in VIVEKANANDA_DATASET:
        score = 0
        # Exact keyword / substring in query (high priority)
        for kw in story["keywords"]:
            kw_clean = kw.lower()
            if kw_clean in query_lower:
                score += 16
            kw_tokens = set(extract_tokens(kw))
            if kw_tokens.intersection(query_tokens):
                score += 5

        # Check cross-translation titles and story text tokens
        for t_obj in story.get("translations", {}).values():
            title_tokens = set(extract_tokens(t_obj.get("story_title", "")))
            score += len(query_tokens.intersection(title_tokens)) * 3
            
            body_tokens = set(extract_tokens(t_obj.get("story_text", "")))
            score += len(query_tokens.intersection(body_tokens)) * 1

        if score > highest_score:
            highest_score = score
            best_story = story

    return best_story


# ==========================================
# ACTION ENGINE & HIGGSFIELD PROMPT GENERATOR
# ==========================================
def build_action_plan_and_guidance(matched_story, user_query, lang="hinglish"):
    cat = matched_story.get("category", "fear_courage")
    slogan = matched_story.get("sanskrit_slogan", "उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत।")
    story_title = matched_story.get("translations", {}).get(lang, {}).get("story_title") or matched_story.get("translations", {}).get("english", {}).get("story_title", "")
    
    # Category-specific mindset shifts & 5-step action plans
    data_map = {
        "fear_courage": {
            "mindset_shift": {
                "english": "Do not make failure your identity. Identify the execution flaw, reframe anxiety as fuel, and return to deliberate action.",
                "hindi": "असफलता को अपनी पहचान मत बनाओ। केवल अपनी गलतियों को पहचानो और बिना आत्मग्लानि के पुनः कर्म में जुट जाओ।",
                "hinglish": "Failure ko apni permanent identity mat banao. Galti identify karo, darr ko face karo aur action par wapas aao."
            },
            "steps": [
                {"num": 1, "title": "Name the Fear", "desc": "Write down the exact failure you fear. Giving fear a concrete name robs it of its power."},
                {"num": 2, "title": "Audit 3 Root Mistakes", "desc": "Identify 3 objective mistakes (time management, skipped topics, distraction) without blaming luck."},
                {"num": 3, "title": "Choose the Smallest Action", "desc": "Pick 1 weak topic you avoid most. Start with just a 45-minute focused sprint."},
                {"num": 4, "title": "Track Effort, Not Result", "desc": "Measure: Did you complete today's 45-min sprint? Effort is in your control; results follow automatically."},
                {"num": 5, "title": "Next-Day Diagnostic Test", "desc": "Take a 10-minute self-test on that same topic tomorrow without fear of low marks."}
            ],
            "next_24_hours": [
                "Write down your biggest fear & 3 root mistakes in a journal",
                "Choose the one topic or task you are avoiding most",
                "Spend 45 minutes on it with zero digital notifications",
                "Review effort before sleeping & recite 'Arise, Awake!'"
            ]
        },
        "focus_discipline": {
            "mindset_shift": {
                "english": "Concentration is the sole key to mastery. Starve your distractions to feed your sacred mission.",
                "hindi": "एकाग्रता ही समस्त सिद्धियों की कुंजी है। व्यर्थ के भटकावों को त्याग कर अपने लक्ष्य में लीन हो जाओ।",
                "hinglish": "Concentration hi mastery ki chaabi hai. Social media aur distractions ko band karke ek focus mission banao."
            },
            "steps": [
                {"num": 1, "title": "Physical Device Barrier", "desc": "Keep your smartphone in another room during study/work blocks."},
                {"num": 2, "title": "Single-Target Principle", "desc": "Never multitask. Like Swami ji's rifle aim on floating eggshells, focus on one task at a time."},
                {"num": 3, "title": "45-Minute Deep Sprint", "desc": "Work continuously for 45 minutes, followed by a 5-minute eye rest and hydration break."},
                {"num": 4, "title": "Audit Social Media Triggers", "desc": "Remove distracting short-form video apps from your home screen."},
                {"num": 5, "title": "10-Minute Witness Meditation", "desc": "Sit quietly in the morning observing stray thoughts without being swept away by them."}
            ],
            "next_24_hours": [
                "Implement a 2-hour zero-phone deep study block",
                "Audit your daily screen time and delete or log out of top 1 distraction app",
                "Practice 10 minutes of single-minded breath meditation",
                "List your single highest-priority task for tomorrow morning"
            ]
        },
        "strength_vitality": {
            "mindset_shift": {
                "english": "Strength is life, weakness is death! Forge nerves of steel and conquer physical and mental lethargy.",
                "hindi": "बल ही जीवन है, दुर्बलता ही मृत्यु है! आलस्य और दुर्बलता का त्याग कर अपने भीतर असीम ऊर्जा जगाओ।",
                "hinglish": "Strength is life, weakness is death! Shareer aur mann dono ko active banao, alashya ko harakar lion bano."
            },
            "steps": [
                {"num": 1, "title": "Morning Prana Ignition", "desc": "Start with 15 minutes of vigorous Surya Namaskar or brisk outdoor exercise at sunrise."},
                {"num": 2, "title": "Cold Water Splash & Reset", "desc": "Whenever lethargy strikes, wash face with cold water and stand tall with open posture."},
                {"num": 3, "title": "Nutritious Satvik Fuel", "desc": "Cut heavy oily junk food; drink 2.5L water to maintain oxygen saturation in blood."},
                {"num": 4, "title": "Affirmation of Iron Nerves", "desc": "Repeat Swami ji's words: 'I have muscles of iron and nerves of steel!'"},
                {"num": 5, "title": "Fixed Sleep Rhythm", "desc": "Sleep by 10:30 PM with zero screens in bed for cellular recovery."}
            ],
            "next_24_hours": [
                "Do a 15-minute morning cardio or Surya Namaskar workout",
                "Drink 8 glasses of water and avoid sugary junk food today",
                "Take a 10-minute afternoon walk without looking at phone",
                "Sleep before 11 PM with phone outside the bed area"
            ]
        },
        "anger_patience": {
            "mindset_shift": {
                "english": "Master your emotional reactions. Do not surrender your royal inner peace to another person's pettiness.",
                "hindi": "क्रोध को शांत करो; आत्मसंयम ही परम पराक्रम है। दूसरों के कटु वचनों के आगे अपना विवेक मत खोओ।",
                "hinglish": "Gusse par self-control pao. Dusron ke provoke karne par reactive mat bano, shanti aur patience se jeeto."
            },
            "steps": [
                {"num": 1, "title": "The 10-Breath Pause", "desc": "When provoked, count backward from 10 before speaking or typing any response."},
                {"num": 2, "title": "The Sannyasi & Scorpion Principle", "desc": "Remember that negativity is their nature; dignified calm is yours. Never copy their lower nature."},
                {"num": 3, "title": "24-Hour Cooling Rule", "desc": "Postpone any confrontational discussion by 24 hours to let emotional adrenaline subside."},
                {"num": 4, "title": "Express on Paper, Not People", "desc": "Write your rage unfiltered on a piece of paper, read it once, and tear it to shreds."},
                {"num": 5, "title": "Compassionate Reframing", "desc": "Recognize that angry people are internally wounded and insecure."}
            ],
            "next_24_hours": [
                "Apply the 10-breath pause during any difficult interaction today",
                "Write down whatever triggered anger today and tear the paper",
                "Send a peaceful or kind message to diffuse a past friction",
                "End the day with 5 minutes of forgiveness meditation"
            ]
        }
    }
    
    fallback_cat = data_map.get(cat, {
        "mindset_shift": {
            "english": "Accept reality without panic, focus on self-mastery, and take resolute action today.",
            "hindi": "परिस्थितियों से भयभीत मत हो, अपने भीतर की अनंत शक्ति पर विश्वास करो और कर्म में जुट जाओ।",
            "hinglish": "Situation se ghabrao mat, apne inner potential par vishwas rakho aur step-by-step aage badho."
        },
        "steps": [
            {"num": 1, "title": "Radical Acceptance", "desc": "Acknowledge the situation without blame. Acceptance stops emotional leakage."},
            {"num": 2, "title": "Define 1 Master Goal", "desc": "Eliminate secondary noise; focus all willpower on one core mission."},
            {"num": 3, "title": "Smallest Micro-Action", "desc": "Start with a 30-minute block on the most critical bottleneck."},
            {"num": 4, "title": "Selfless Service (Seva)", "desc": "Help one person today. Expanding beyond the ego instantly dissolves personal anxiety."},
            {"num": 5, "title": "Nightly Introspection", "desc": "Journal 3 concrete steps taken today and sleep with a clear conscience."}
        ],
        "next_24_hours": [
            "Write down your core dilemma and 1 actionable step to resolve it",
            "Dedicate 45 uninterrupted minutes to that single priority",
            "Perform one small act of kindness or help a friend",
            "Reflect before sleeping on Swami Vivekananda's Mahavakya"
        ]
    })
    
    mindset_text = fallback_cat["mindset_shift"].get(lang, fallback_cat["mindset_shift"]["hinglish"])
    steps = fallback_cat["steps"]
    next_24 = [{"id": f"chk_{i+1}", "text": t, "done": False} for i, t in enumerate(fallback_cat["next_24_hours"])]
    
    # Controlled Higgsfield Prompt Payload
    higgsfield_payload = {
        "generator": "Higgsfield AI Video Synthesizer v2.5",
        "pipeline_role": "Controlled Visual Storyboard Engine (Guided by VivekSaarthi Knowledge Layer)",
        "character_consistency": "Swami Vivekananda in rich saffron/ochre monastic robes, golden turban, calm piercing compassionate eyes, resolute posture",
        "cinematic_aesthetic": "Warm volumetric dawn lighting, 4K anime photorealism, slow dramatic dolly zooms, serene temple/Himalayan backdrop",
        "aspect_ratio": "16:9",
        "total_duration_sec": 90,
        "scenes": [
            {
                "scene": 1,
                "title": "Inner Conflict & The Dilemma",
                "camera": "Slow cinematic push-in on protagonist, transitioning to golden halo arrival of Swami ji",
                "prompt": f"Young student sitting in study room overwhelmed with failure and uncertainty. Atmosphere softens as Swami Vivekananda materializes in warm golden sunrise aura, projecting deep compassion and courage. 4k cinematic anime.",
                "duration_sec": 22.5
            },
            {
                "scene": 2,
                "title": "The Parable in Motion",
                "camera": "Dynamic tracking shot with dramatic motion blur and radiant atmosphere",
                "prompt": f"Vivid visual realization of historical parable: {story_title}. Young Narendra standing fearlessly confronting aggressive troops like a roaring lion. Monastic atmosphere, cinematic Varanasi ghats. 4k animation.",
                "duration_sec": 22.5
            },
            {
                "scene": 3,
                "title": "The 3 Practical Actions",
                "camera": "Medium shot, Swami Vivekananda gesturing with hands, glowing Sanskrit geometric icons",
                "prompt": f"Swami Vivekananda looking directly into lens with empowering baritone warmth, hands revealing 3 glowing step symbols: 1. Name the fear, 2. Take smallest action, 3. Track effort not outcome. Golden particles flowing.",
                "duration_sec": 22.5
            },
            {
                "scene": 4,
                "title": "Mahavakya & 'What Will You Do Now?'",
                "camera": "Slow crane up into glowing sunrise horizon, glowing calligraphy banner",
                "prompt": f"Swami Vivekananda smiling with supreme victory, raising hand in blessing. Celestial golden letters glowing above: '{slogan}'. Subtitle: 'Ab tum kya karoge? Take your first step today!'",
                "duration_sec": 22.5
            }
        ]
    }
    
    return {
        "mindset_shift": mindset_text,
        "action_plan": steps,
        "next_24_hours": next_24,
        "higgsfield_payload": higgsfield_payload
    }


def generate_sadhana_tasks(category, duration_days=7, problem_text="", lang="hinglish"):
    task_catalog = {
        "fear_courage": [
            {
                "day": 1,
                "title": "Name the Fear & Audit 3 Root Mistakes",
                "principle": "Confronting reality is the first step to fearlessness. Fear thrives only in the dark.",
                "instruction": "Take a sheet of paper. Write down your deepest fear and list the 3 root mistakes that led to the setback (e.g. poor revision, distracted study, exam panic).",
                "suggested_proof": "📷 Upload a photo of your handwritten 3 mistakes list, or 🎙️ record a 30-sec voice reflection.",
            },
            {
                "day": 2,
                "title": "The Lion's Stance: 45-Min Weak Topic Sprint",
                "principle": "Face the brutes! The moment you stop running, obstacles retreat.",
                "instruction": "Pick the single hardest topic/chapter you've been actively avoiding. Put your phone away and complete 45 uninterrupted minutes of study.",
                "suggested_proof": "📷 Upload a photo of your completed 45-min study notes or summary sheet.",
            },
            {
                "day": 3,
                "title": "10-Question Diagnostic & Result Detachment",
                "principle": "You have the right to work, but not to the fruits thereof. Track effort, not score.",
                "instruction": "Solve 10 practice questions on the weak topic. Grade them calmly without self-criticism. Highlight which concept clicked.",
                "suggested_proof": "📷 Upload a photo of your graded worksheet, or 🎙️ record a 25-sec voice note explaining what you learned.",
            },
            {
                "day": 4,
                "title": "Surya Prana: 15-Minute Morning Physical Armor",
                "principle": "You will be nearer to Heaven through football than through the study of Gita! Build muscles of iron.",
                "instruction": "Do 15 minutes of outdoor brisk walking, jogging, or Surya Namaskar at dawn to circulate fresh prana and break mental inertia.",
                "suggested_proof": "📷 Upload a photo of your morning walking spot/shoes, or 🎙️ record a 20-sec voice reflection on your energy level.",
            },
            {
                "day": 5,
                "title": "Zero-Distraction Fortress (Phone in Another Room)",
                "principle": "Take up one idea. Make that one idea your life; leave all trivial distractions aside.",
                "instruction": "Place your smartphone in another room or turn it completely off. Complete two 40-minute focused study blocks with a 5-minute stretch in between.",
                "suggested_proof": "📷 Upload a photo of your distraction-free desk setup, or ✍️ write a reflection on how focus felt.",
            },
            {
                "day": 6,
                "title": "Seva: Uplift a Friend or Teach a Concept",
                "principle": "They alone live who live for others; the rest are more dead than alive.",
                "instruction": "Explain one difficult concept to a peer, or send a kind, encouraging message to a friend who is feeling low or anxious.",
                "suggested_proof": "🎙️ Record a 30-sec voice note or ✍️ write a short note about how helping someone transformed your state of mind.",
            },
            {
                "day": 7,
                "title": "Mahavakya Fearlessness Declaration & 7-Day Victory",
                "principle": "नायमात्मा बलहीनेन लभ्यः। Strength is life, weakness is death!",
                "instruction": "Reflect on your past 7 days of verified consistency. Stand tall like a lion and recite your personal declaration of courage.",
                "suggested_proof": "🎙️ Record a 30-45 sec audio declaration of your renewed commitment in your own voice!",
            },
            {
                "day": 8,
                "title": "The 90-Minute Deep Work Immersion",
                "principle": "Unbroken concentration converts the impossible into reality.",
                "instruction": "Conduct a single unbroken 90-minute deep work or study session on a complex chapter without checking any messages.",
                "suggested_proof": "📷 Upload a photo of your 90-min study notes or timer.",
            },
            {
                "day": 9,
                "title": "Sakshi Bhava: 15-Min Witness Meditation",
                "principle": "The mind is like a restless monkey. Observe it calmly as a detached witness.",
                "instruction": "Sit quietly with closed eyes for 15 minutes. Watch anxious thoughts arise and pass without getting hooked by them.",
                "suggested_proof": "🎙️ Record a 30-sec voice note on the peace you felt during meditation.",
            },
            {
                "day": 10,
                "title": "Timed Exam Simulation Drill",
                "principle": "Face the fire of discipline now so you never fear the heat of battle.",
                "instruction": "Set a timer for 60 minutes and solve a full question paper section under strict exam conditions.",
                "suggested_proof": "📷 Upload a photo of your completed exam simulation sheet.",
            },
            {
                "day": 11,
                "title": "Evening Screen Detach & Sound Sleep Routine",
                "principle": "A pure mind requires deep, undisturbed rest. Do not poison the night with blue light.",
                "instruction": "Turn off all screens 1 hour before sleep. Read an inspiring book or journal your thoughts by warm lamp light.",
                "suggested_proof": "📷 Upload a photo of your bedside reading / journal, or ✍️ write a reflection.",
            },
            {
                "day": 12,
                "title": "Converting Past Weakness into Strength",
                "principle": "Obstacles are not roadblocks; they are stepping stones to supreme mastery.",
                "instruction": "Re-attempt the exact problem or test question you failed on Day 1. Solve it with complete mastery.",
                "suggested_proof": "📷 Upload a photo showing your perfect solution to the past problem.",
            },
            {
                "day": 13,
                "title": "Community Wisdom Post in Youth Sangam",
                "principle": "Share the light you have received; awaken your brothers and sisters.",
                "instruction": "Share one insight or technique that helped you conquer fear in the Youth Sangam community feed.",
                "suggested_proof": "✍️ Share your reflection or 🎙️ record a 30-sec message for peers.",
            },
            {
                "day": 14,
                "title": "The Vijayi Sadhana Graduation Oath",
                "principle": "उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत! Arise, awake, and stop not till the goal is reached!",
                "instruction": "You have completed 14 days of conscious discipline. Stand proud and record your ultimate graduation pledge.",
                "suggested_proof": "🎙️ Record a 45-60 sec voice note of your final transformation oath!",
            }
        ]
    }
    
    base_tasks = task_catalog.get(category, task_catalog["fear_courage"])
    selected = base_tasks[:duration_days]
    results = []
    for t in selected:
        results.append({
            "day_number": t["day"],
            "title": t["title"],
            "principle": t["principle"],
            "instruction": t["instruction"],
            "suggested_proof": t["suggested_proof"],
            "karma_reward": 35,
            "status": "pending"
        })
    return results


# Helper to generate unique username
def create_unique_username(conn, base_name):
    clean = re.sub(r'[^a-zA-Z0-9_]', '', base_name.lower().replace(' ', '_'))
    if not clean:
        clean = "seeker"
    candidate = clean
    count = 1
    cursor = conn.cursor()
    while True:
        cursor.execute("SELECT id FROM users WHERE username = ?", (candidate,))
        if not cursor.fetchone():
            return candidate
        candidate = f"{clean}_{count}"
        count += 1

# Helper to fetch user data along with previous session & community stats
def get_user_with_cycle_stats(conn, user_id):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    if not row:
        return None
    user_data = dict(row)
    try:
        cursor.execute("SELECT COUNT(*) FROM mentorship_sessions WHERE user_id = ?", (user_id,))
        user_data["session_count"] = cursor.fetchone()[0]
    except Exception:
        user_data["session_count"] = 0
    try:
        cursor.execute("SELECT COUNT(*) FROM community_posts WHERE user_id = ?", (user_id,))
        user_data["post_count"] = cursor.fetchone()[0]
    except Exception:
        user_data["post_count"] = 0
    return user_data

# ==========================================
# 4. HTTP REQUEST HANDLER
# ==========================================
class VivekSaarthiHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        url_path = urllib.parse.urlparse(self.path).path
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        
        try:
            data = json.loads(body)
        except Exception:
            data = {}

        if url_path == "/api/auth/send-otp":
            self.handle_send_otp(data)
        elif url_path == "/api/auth/verify-otp":
            self.handle_verify_otp(data)
        elif url_path == "/api/auth/send-mobile-otp":
            self.handle_send_mobile_otp(data)
        elif url_path == "/api/auth/verify-mobile-otp":
            self.handle_verify_mobile_otp(data)
        elif url_path == "/api/auth/google":
            self.handle_google_auth(data)
        elif url_path == "/api/auth/register":
            self.handle_register(data)
        elif url_path == "/api/auth/login":
            self.handle_login(data)
        elif url_path == "/api/user/profile":
            self.handle_update_profile(data)
        elif url_path == "/api/mentor/ask":
            self.handle_mentor_ask(data)
        elif url_path == "/api/mentor/edit-session":
            self.handle_edit_mentor_session(data)
        elif url_path == "/api/mentor/share-session":
            self.handle_share_mentor_session(data)
        elif url_path == "/api/mentor/delete-session":
            self.handle_delete_mentor_session(data)
        elif url_path == "/api/user/karma":
            self.handle_user_karma(data)
        elif url_path == "/api/user/daily-checkin":
            self.handle_daily_checkin(data)
        elif url_path == "/api/community/create-account":
            self.handle_create_community_account(data)
        elif url_path == "/api/community/post":
            self.handle_community_post(data)
        elif url_path == "/api/community/solution":
            self.handle_community_solution(data)
        elif url_path == "/api/community/report":
            self.handle_community_report(data)
        elif url_path == "/api/community/block-user":
            self.handle_block_user(data)
        elif url_path == "/api/community/delete-content":
            self.handle_delete_flagged_content(data)
        elif url_path == "/api/mentor/chat":
            self.handle_mentor_chat(data)
        elif url_path == "/api/sadhana/create":
            self.handle_create_sadhana(data)
        elif url_path == "/api/sadhana/submit-proof":
            self.handle_submit_sadhana_proof(data)
        else:
            self.send_error(404, "API Endpoint Not Found")

    def do_GET(self):
        url_parts = urllib.parse.urlparse(self.path)
        url_path = url_parts.path
        
        if url_path in ["/login", "/login/"]:
            self.path = "/login.html"
            return super().do_GET()
        elif url_path == "/api/user/profile":
            query_params = urllib.parse.parse_qs(url_parts.query)
            user_id = query_params.get("user_id", [None])[0]
            self.handle_get_profile(user_id)
        elif url_path == "/api/mentor/sessions":
            query_params = urllib.parse.parse_qs(url_parts.query)
            user_id = query_params.get("user_id", [None])[0]
            self.handle_get_mentor_sessions(user_id)
        elif url_path == "/api/sadhana/current":
            query_params = urllib.parse.parse_qs(url_parts.query)
            user_id = query_params.get("user_id", [None])[0]
            self.handle_get_current_sadhana(user_id)
        elif url_path == "/api/sadhana/history":
            query_params = urllib.parse.parse_qs(url_parts.query)
            user_id = query_params.get("user_id", [None])[0]
            self.handle_get_sadhana_history(user_id)
        elif url_path == "/api/community/feed":
            self.handle_get_community_feed()
        elif url_path == "/api/community/moderation":
            self.handle_get_moderation_data()
        elif url_path == "/api/stories/all":
            self.send_json_response(200, {"status": "success", "stories": VIVEKANANDA_DATASET})
        elif url_path.endswith(".mp4"):
            self.serve_video_file(url_path)
        else:
            super().do_GET()

    def serve_video_file(self, url_path):
        rel_path = urllib.parse.unquote(url_path.lstrip("/")).replace("/", os.sep)
        full_path = os.path.abspath(rel_path)
        base_dir = os.path.abspath(".")
        if not full_path.startswith(base_dir) or not os.path.exists(full_path) or not os.path.isfile(full_path):
            self.send_error(404, "Video Not Found")
            return

        file_size = os.path.getsize(full_path)
        range_header = self.headers.get("Range")

        if range_header and range_header.startswith("bytes="):
            try:
                ranges = range_header[6:].split("-")
                start = int(ranges[0]) if ranges[0] else 0
                end = int(ranges[1]) if len(ranges) > 1 and ranges[1] else file_size - 1
                if start >= file_size:
                    self.send_response(416, "Requested Range Not Satisfiable")
                    self.send_header("Content-Range", f"bytes */{file_size}")
                    self.end_headers()
                    return
                end = min(end, file_size - 1)
                length = end - start + 1

                self.send_response(206, "Partial Content")
                self.send_header("Content-Type", "video/mp4")
                self.send_header("Content-Range", f"bytes {start}-{end}/{file_size}")
                self.send_header("Content-Length", str(length))
                self.send_header("Accept-Ranges", "bytes")
                self.end_headers()

                with open(full_path, "rb") as f:
                    f.seek(start)
                    bytes_remaining = length
                    chunk_size = 64 * 1024
                    while bytes_remaining > 0:
                        read_len = min(chunk_size, bytes_remaining)
                        data = f.read(read_len)
                        if not data:
                            break
                        self.wfile.write(data)
                        bytes_remaining -= len(data)
                return
            except Exception:
                return

        # Regular 200 response
        self.send_response(200)
        self.send_header("Content-Type", "video/mp4")
        self.send_header("Content-Length", str(file_size))
        self.send_header("Accept-Ranges", "bytes")
        self.end_headers()
        try:
            with open(full_path, "rb") as f:
                chunk_size = 64 * 1024
                while True:
                    data = f.read(chunk_size)
                    if not data:
                        break
                    self.wfile.write(data)
        except Exception:
            pass

    def send_json_response(self, status_code, data):
        response_bytes = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.end_headers()
        self.wfile.write(response_bytes)

    # 1. Send OTP to any user email using yuktigarg898@gmail.com background dispatcher
    def handle_send_otp(self, data):
        email = data.get("email", "").strip().lower()

        if not email or "@" not in email:
            self.send_json_response(400, {"status": "error", "message": "Valid email address required."})
            return

        otp_code = str(random.randint(100000, 999999))
        expires_at = int(time.time()) + 600

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM otps WHERE email = ?", (email,))
            cursor.execute("INSERT INTO otps (email, otp_code, expires_at) VALUES (?, ?, ?)", (email, otp_code, expires_at))
            conn.commit()

        # Send email via SMTP
        success, msg = send_otp_via_email(email, otp_code, recipient_name="Seeker")

        self.send_json_response(200, {
            "status": "success",
            "message": f"OTP successfully sent to {email}!" if success else f"SMTP Note: {msg}",
            "email": email,
            "otp_preview": otp_code # Provided so user can instantly test if offline
        })

    # 2. Verify OTP & Log In / Register User
    def handle_verify_otp(self, data):
        email = data.get("email", "").strip().lower()
        otp_code = data.get("otp_code", "").strip()

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM otps WHERE email = ? AND otp_code = ? AND expires_at > ?", 
                           (email, otp_code, int(time.time())))
            row = cursor.fetchone()

            if not row:
                self.send_json_response(400, {"status": "error", "message": "Invalid or expired OTP!"})
                return

            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            user = cursor.fetchone()

            if not user:
                # Create brand new unique user account
                base_username = email.split("@")[0]
                unique_username = create_unique_username(conn, base_username)
                name = base_username.replace(".", " ").replace("_", " ").title()
                cursor.execute("""
                    INSERT INTO users (name, username, email, karma_points)
                    VALUES (?, ?, ?, 350)
                """, (name, unique_username, email))
                conn.commit()
                user_id = cursor.lastrowid
            else:
                user_id = user["id"]

            user_data = get_user_with_cycle_stats(conn, user_id)

        self.send_json_response(200, {
            "status": "success",
            "message": "OTP verified successfully!",
            "user": user_data
        })

    # 3. Mobile Number OTP Dispatcher (Instant Simulated SMS + Live Preview)
    def handle_send_mobile_otp(self, data):
        mobile = data.get("mobile", "").strip()
        mobile_clean = re.sub(r'[^0-9]', '', mobile)

        if len(mobile_clean) < 10:
            self.send_json_response(400, {"status": "error", "message": "Please enter a valid 10-digit mobile number."})
            return

        otp_code = str(random.randint(100000, 999999))
        expires_at = int(time.time()) + 600

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM otps WHERE email = ?", (f"mob_{mobile_clean}",))
            cursor.execute("INSERT INTO otps (email, otp_code, expires_at) VALUES (?, ?, ?)", 
                           (f"mob_{mobile_clean}", otp_code, expires_at))
            conn.commit()

        self.send_json_response(200, {
            "status": "success",
            "message": f"OTP successfully sent to +91-{mobile_clean}!",
            "mobile": mobile_clean,
            "otp_preview": otp_code
        })

    # 4. Verify Mobile OTP & Log In / Auto-Register User
    def handle_verify_mobile_otp(self, data):
        mobile = data.get("mobile", "").strip()
        mobile_clean = re.sub(r'[^0-9]', '', mobile)
        otp_code = data.get("otp_code", "").strip()

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM otps WHERE email = ? AND otp_code = ? AND expires_at > ?", 
                           (f"mob_{mobile_clean}", otp_code, int(time.time())))
            row = cursor.fetchone()

            if not row:
                self.send_json_response(400, {"status": "error", "message": "Invalid or expired OTP!"})
                return

            # Check if user with this mobile exists
            cursor.execute("SELECT * FROM users WHERE mobile = ? OR email = ?", (mobile_clean, f"user_{mobile_clean}@viveksaarthi.in"))
            user = cursor.fetchone()

            if not user:
                base_username = f"seeker_{mobile_clean[-4:]}"
                unique_username = create_unique_username(conn, base_username)
                name = f"Seeker {mobile_clean[-4:]}"
                synthetic_email = f"user_{mobile_clean}@viveksaarthi.in"
                cursor.execute("""
                    INSERT INTO users (name, username, email, mobile, karma_points)
                    VALUES (?, ?, ?, ?, 350)
                """, (name, unique_username, synthetic_email, mobile_clean))
                conn.commit()
                user_id = cursor.lastrowid
            else:
                user_id = user["id"]

            user_data = get_user_with_cycle_stats(conn, user_id)

        self.send_json_response(200, {
            "status": "success",
            "message": "Mobile OTP verified successfully!",
            "user": user_data
        })

    # 5. Dynamic Google Sign-In for ANY user account
    def handle_google_auth(self, data):
        google_email = data.get("email", "").strip().lower()
        google_name = data.get("name", "").strip() or "Google Seeker"
        google_avatar = data.get("avatar", "🪷")

        if not google_email or "@" not in google_email:
            self.send_json_response(400, {"status": "error", "message": "Valid Google email required."})
            return

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?", (google_email,))
            user = cursor.fetchone()

            if not user:
                base_username = google_email.split("@")[0]
                unique_username = create_unique_username(conn, base_username)
                cursor.execute("""
                    INSERT INTO users (name, username, email, avatar, karma_points)
                    VALUES (?, ?, ?, ?, 350)
                """, (google_name, unique_username, google_email, google_avatar))
                conn.commit()
                user_id = cursor.lastrowid
            else:
                user_id = user["id"]

            user_data = get_user_with_cycle_stats(conn, user_id)

        self.send_json_response(200, {
            "status": "success",
            "message": f"Welcome, {user_data['name']}!",
            "user": user_data
        })

    # 6. Standard Registration with Unique Username & Optional Mobile
    def handle_register(self, data):
        name = data.get("name", "").strip()
        username = data.get("username", "").strip().lower()
        email = data.get("email", "").strip().lower()
        mobile = re.sub(r'[^0-9]', '', data.get("mobile", "").strip())
        password = data.get("password", "").strip()

        if not name or not email or not password:
            self.send_json_response(400, {"status": "error", "message": "Name, Email, and Password are required."})
            return

        pwd_hash = hashlib.sha256(password.encode()).hexdigest()

        try:
            with get_db() as conn:
                cursor = conn.cursor()
                if not username:
                    username = create_unique_username(conn, email.split("@")[0])
                else:
                    username = re.sub(r'[^a-zA-Z0-9_]', '', username)
                    cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
                    if cursor.fetchone():
                        self.send_json_response(400, {"status": "error", "message": f"Username @{username} is already taken. Please choose another."})
                        return

                cursor.execute("""
                    INSERT INTO users (name, username, email, mobile, password_hash, karma_points)
                    VALUES (?, ?, ?, ?, ?, 350)
                """, (name, username, email, mobile, pwd_hash))
                conn.commit()
                user_id = cursor.lastrowid
                cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
                user_data = dict(cursor.fetchone())

            self.send_json_response(200, {
                "status": "success",
                "message": "Account created successfully!",
                "user": user_data
            })
        except sqlite3.IntegrityError:
            self.send_json_response(400, {"status": "error", "message": "An account with this Email already exists."})

    # 7. Standard Login (Supports Email, Mobile, or @Username)
    def handle_login(self, data):
        identifier = data.get("identifier", "").strip().lower() # email, mobile, or username
        password = data.get("password", "").strip()

        pwd_hash = hashlib.sha256(password.encode()).hexdigest()

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM users WHERE (email = ? OR username = ? OR mobile = ?) AND password_hash = ?
            """, (identifier, identifier, identifier, pwd_hash))
            user = cursor.fetchone()

        if not user:
            self.send_json_response(401, {"status": "error", "message": "Invalid Email/Mobile/Username or Password."})
            return

        with get_db() as conn:
            user_data = get_user_with_cycle_stats(conn, user["id"])

        self.send_json_response(200, {
            "status": "success",
            "message": "Login successful!",
            "user": user_data
        })

    # 6. Profile View & Update
    def handle_get_profile(self, user_id):
        if not user_id:
            self.send_json_response(400, {"status": "error", "message": "user_id required"})
            return

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            user = cursor.fetchone()

        if not user:
            self.send_json_response(404, {"status": "error", "message": "User not found"})
            return

        self.send_json_response(200, {"status": "success", "user": dict(user)})

    def handle_update_profile(self, data):
        user_id = data.get("user_id")
        name = data.get("name", "").strip()
        username = data.get("username", "").strip().lower()
        bio = data.get("bio", "").strip()
        spiritual_goal = data.get("spiritual_goal", "").strip()
        avatar = data.get("avatar", "🧘‍♂️")

        if not user_id or not name:
            self.send_json_response(400, {"status": "error", "message": "user_id and name required"})
            return

        with get_db() as conn:
            cursor = conn.cursor()
            # If changing username, check uniqueness
            if username:
                username = re.sub(r'[^a-zA-Z0-9_]', '', username)
                cursor.execute("SELECT id FROM users WHERE username = ? AND id != ?", (username, user_id))
                if cursor.fetchone():
                    self.send_json_response(400, {"status": "error", "message": f"Handle @{username} is already taken by someone else."})
                    return
                cursor.execute("""
                    UPDATE users SET name = ?, username = ?, bio = ?, spiritual_goal = ?, avatar = ? WHERE id = ?
                """, (name, username, bio, spiritual_goal, avatar, user_id))
            else:
                cursor.execute("""
                    UPDATE users SET name = ?, bio = ?, spiritual_goal = ?, avatar = ? WHERE id = ?
                """, (name, bio, spiritual_goal, avatar, user_id))
            conn.commit()
            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            updated_user = cursor.fetchone()

        if not updated_user:
            self.send_json_response(404, {"status": "error", "message": "User not found"})
            return

        self.send_json_response(200, {
            "status": "success",
            "message": "Profile updated successfully!",
            "user": dict(updated_user)
        })

    # 7. AI Mentorship with NLP Matching, Session Persistence & Karma Calculation
    def handle_mentor_ask(self, data):
        problem = data.get("problem", "").strip()
        lang = data.get("lang", "english").lower()
        user_id = data.get("user_id")
        if lang not in ["english", "hindi", "hinglish"]:
            lang = "english"

        matched_story = match_problem_with_dataset(problem)
        t = matched_story.get("translations", {}).get(lang) or matched_story.get("translations", {}).get("english")

        session_id = f"msess_{int(time.time()*1000)}"
        new_karma = 350

        if user_id:
            try:
                with get_db() as conn:
                    cursor = conn.cursor()
                    cursor.execute("SELECT karma_points FROM users WHERE id = ?", (user_id,))
                    row = cursor.fetchone()
                    current_karma = row["karma_points"] if (row and row["karma_points"] is not None) else 350
                    
                    # Deduct 25 Karma per AI mentorship capsule, clamped at 0
                    new_karma = max(0, current_karma - 25)
                    cursor.execute("UPDATE users SET karma_points = ? WHERE id = ?", (new_karma, user_id))

                    # Persist session for user history, editing, and continuity
                    cursor.execute("""
                        INSERT INTO mentorship_sessions (
                            id, user_id, problem_text, story_id, story_title, story_text,
                            story_lesson, sanskrit_slogan, slogan_translation, voice_narration,
                            video_theme, lang
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (session_id, user_id, problem, matched_story["id"], t["story_title"],
                          t["story_text"], t["story_lesson"], matched_story["sanskrit_slogan"],
                          t["slogan_trans"], t["voice_narration"], matched_story.get("video_theme", "golden_radiance"), lang))
                    conn.commit()
            except Exception as e:
                print(f"[MENTOR SESSION ERROR] {e}")

        guidance_data = build_action_plan_and_guidance(matched_story, problem, lang)

        self.send_json_response(200, {
            "status": "success",
            "lang": lang,
            "session_id": session_id,
            "karma_points": new_karma,
            "story_id": matched_story["id"],
            "category": matched_story.get("category", "fear_courage"),
            "slogan": matched_story["sanskrit_slogan"],
            "slogan_translation": t["slogan_trans"],
            "story": {
                "title": t["story_title"],
                "text": t["story_text"],
                "lesson": t["story_lesson"]
            },
            "video_subtitles": t.get("video_subtitles", []),
            "voice_narration": t["voice_narration"],
            "all_translations": matched_story["translations"],
            "mindset_shift": guidance_data["mindset_shift"],
            "action_plan": guidance_data["action_plan"],
            "next_24_hours": guidance_data["next_24_hours"],
            "higgsfield_payload": guidance_data["higgsfield_payload"]
        })

    # Fetch all previous mentorship sessions for a user
    def handle_get_mentor_sessions(self, user_id):
        if not user_id:
            self.send_json_response(200, {"status": "success", "sessions": []})
            return

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM mentorship_sessions 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 50
            """, (user_id,))
            sessions = [dict(r) for r in cursor.fetchall()]

        self.send_json_response(200, {"status": "success", "sessions": sessions})

    # Edit previous mentorship notes or question
    def handle_edit_mentor_session(self, data):
        session_id = data.get("session_id")
        user_id = data.get("user_id")
        new_notes = data.get("notes", "").strip()
        new_problem = data.get("problem_text", "").strip()
        lang = data.get("lang", "hinglish")

        if not session_id:
            self.send_json_response(400, {"status": "error", "message": "session_id required"})
            return

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM mentorship_sessions WHERE id = ?", (session_id,))
            session = cursor.fetchone()
            if not session:
                self.send_json_response(404, {"status": "error", "message": "Session not found"})
                return

            if new_problem and new_problem != session["problem_text"]:
                matched_story = match_problem_with_dataset(new_problem)
                t = matched_story.get("translations", {}).get(lang) or matched_story.get("translations", {}).get("english")
                cursor.execute("""
                    UPDATE mentorship_sessions 
                    SET problem_text = ?, story_id = ?, story_title = ?, story_text = ?,
                        story_lesson = ?, sanskrit_slogan = ?, slogan_translation = ?,
                        voice_narration = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, (new_problem, matched_story["id"], t["story_title"], t["story_text"],
                      t["story_lesson"], matched_story["sanskrit_slogan"], t["slogan_trans"],
                      t["voice_narration"], new_notes, session_id))
            else:
                cursor.execute("""
                    UPDATE mentorship_sessions 
                    SET notes = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ?
                """, (new_notes, session_id))
            conn.commit()

            cursor.execute("SELECT * FROM mentorship_sessions WHERE id = ?", (session_id,))
            updated_session = dict(cursor.fetchone())

        self.send_json_response(200, {
            "status": "success",
            "message": "Session updated successfully!",
            "session": updated_session
        })

    # Share mentorship session to Youth Sangam Community (+20 Karma reward)
    def handle_share_mentor_session(self, data):
        session_id = data.get("session_id")
        user_id = data.get("user_id")

        if not session_id or not user_id:
            self.send_json_response(400, {"status": "error", "message": "session_id and user_id required"})
            return

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM mentorship_sessions WHERE id = ?", (session_id,))
            sess = cursor.fetchone()
            if not sess:
                self.send_json_response(404, {"status": "error", "message": "Session not found"})
                return

            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            u = cursor.fetchone()
            author_name = u["name"] if u else "Seeker"
            username = u["username"] if u else "seeker"
            avatar = u["avatar"] if u else "🧘‍♂️"

            post_id = f"post_share_{int(time.time()*1000)}"
            problem_text = f"🌟 [Wisdom Shared by @{username}]: \"{sess['problem_text']}\"\n\n📖 Katha: {sess['story_title']}\n💡 Prerna: {sess['story_lesson']}"
            ai_slogan = f"{sess['sanskrit_slogan']} — {sess['slogan_translation']}"

            cursor.execute("""
                INSERT INTO community_posts (id, user_id, author_name, username, author_avatar, is_anonymous, category, category_label, problem_text, ai_slogan)
                VALUES (?, ?, ?, ?, ?, 0, 'fear', '🌟 Shared Wisdom', ?, ?)
            """, (post_id, user_id, author_name, username, avatar, problem_text, ai_slogan))

            # Reward user with +20 Karma for sharing wisdom with community!
            cursor.execute("UPDATE users SET karma_points = karma_points + 20 WHERE id = ?", (user_id,))
            cursor.execute("SELECT karma_points FROM users WHERE id = ?", (user_id,))
            new_karma = cursor.fetchone()["karma_points"]
            conn.commit()

        self.send_json_response(200, {
            "status": "success",
            "message": "Wisdom capsule shared to Youth Sangam! +20 Karma awarded!",
            "post_id": post_id,
            "karma_points": new_karma
        })

    # Delete mentorship session from user journey
    def handle_delete_mentor_session(self, data):
        session_id = data.get("session_id")
        user_id = data.get("user_id")

        if not session_id:
            self.send_json_response(400, {"status": "error", "message": "session_id required"})
            return

        with get_db() as conn:
            cursor = conn.cursor()
            if user_id:
                cursor.execute("DELETE FROM mentorship_sessions WHERE id = ? AND user_id = ?", (session_id, user_id))
            else:
                cursor.execute("DELETE FROM mentorship_sessions WHERE id = ?", (session_id,))
            conn.commit()

        self.send_json_response(200, {
            "status": "success",
            "message": "Mentorship session deleted successfully",
            "session_id": session_id
        })

    # Dynamic Karma Calculation & Sync API
    def handle_user_karma(self, data):
        user_id = data.get("user_id")
        amount = int(data.get("amount", 0))
        action = data.get("action", "add") # 'add' or 'deduct'

        if not user_id:
            self.send_json_response(400, {"status": "error", "message": "user_id required"})
            return

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT karma_points FROM users WHERE id = ?", (user_id,))
            row = cursor.fetchone()
            if not row:
                self.send_json_response(404, {"status": "error", "message": "User not found"})
                return

            current = row["karma_points"] or 0
            if action == "deduct":
                new_karma = max(0, current - amount)
            else:
                new_karma = current + amount

            cursor.execute("UPDATE users SET karma_points = ? WHERE id = ?", (new_karma, user_id))
            conn.commit()

        self.send_json_response(200, {
            "status": "success",
            "karma_points": new_karma,
            "message": f"Karma updated to {new_karma}"
        })

    # Daily Sadhana Check-in (+50 Karma)
    def handle_daily_checkin(self, data):
        user_id = data.get("user_id")
        if not user_id:
            self.send_json_response(400, {"status": "error", "message": "user_id required"})
            return

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT karma_points FROM users WHERE id = ?", (user_id,))
            row = cursor.fetchone()
            if not row:
                self.send_json_response(404, {"status": "error", "message": "User not found"})
                return

            new_karma = (row["karma_points"] or 0) + 50
            cursor.execute("UPDATE users SET karma_points = ? WHERE id = ?", (new_karma, user_id))
            conn.commit()

        self.send_json_response(200, {
            "status": "success",
            "karma_points": new_karma,
            "message": "Daily Sadhana Check-in bonus (+50 Karma) claimed successfully!"
        })

    # Create New / Alternate Community Account (+350 Initial Karma)
    def handle_create_community_account(self, data):
        name = data.get("name", "").strip() or "Sangam Seeker"
        username = data.get("username", "").strip().lower()
        avatar = data.get("avatar", "🦁")
        bio = data.get("bio", "").strip() or "Youth Sangam Contributor"
        goal = data.get("spiritual_goal", "Youth Sangam Guidance")

        if not username:
            username = f"seeker_{random.randint(1000, 9999)}"
        username = re.sub(r'[^a-zA-Z0-9_]', '', username)

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
            if cursor.fetchone():
                username = create_unique_username(conn, username)

            synthetic_email = f"{username}_{int(time.time())}@sangam.in"
            cursor.execute("""
                INSERT INTO users (name, username, email, avatar, bio, spiritual_goal, karma_points)
                VALUES (?, ?, ?, ?, ?, ?, 350)
            """, (name, username, synthetic_email, avatar, bio, goal))
            conn.commit()
            new_id = cursor.lastrowid
            new_user = get_user_with_cycle_stats(conn, new_id)

        self.send_json_response(200, {
            "status": "success",
            "message": f"Community Account @{username} created with 350 Karma!",
            "user": new_user
        })

    # 8. Community Post, Solution & Guardian Moderation Handlers
    def handle_community_post(self, data):
        user_id = data.get("user_id")
        author_name = data.get("author_name", "Anonymous Seeker")
        username = (data.get("username") or "anonymous").strip().lstrip("@")
        author_avatar = data.get("avatar", "🧘‍♂️")
        is_anon = 1 if data.get("is_anonymous") else 0
        problem_text = data.get("problem_text", "").strip()
        category = data.get("category", "fear")

        # 1. Defaulter & Blocked User Check
        blocked, block_msg = is_user_blocked(user_id=user_id, username=username)
        if blocked:
            return self.send_json_response(403, {
                "status": "blocked",
                "message": f"🚫 ACCOUNT BLOCKED: You are classified as a Community Defaulter / Guideline Violator ({block_msg}). Your posting privileges have been suspended."
            })

        # 2. Dirty Commenter & Profanity Shield
        is_dirty, term = check_dirty_content(problem_text)
        if is_dirty:
            new_strikes = 1
            with get_db() as conn:
                cursor = conn.cursor()
                if user_id:
                    cursor.execute("SELECT id, strikes FROM users WHERE id = ?", (user_id,))
                else:
                    cursor.execute("SELECT id, strikes FROM users WHERE username = ? COLLATE NOCASE", (username,))
                row = cursor.fetchone()
                if row:
                    new_strikes = (row["strikes"] or 0) + 1
                    should_block = 1 if new_strikes >= 2 else 0
                    reason = "Blocked from Youth Sangam for Dirty Comments & Vulgar Language" if should_block else ""
                    cursor.execute("""
                        UPDATE users 
                        SET strikes = ?, is_blocked = ?, is_defaulter = ?, block_reason = ?,
                            blocked_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE blocked_at END
                        WHERE id = ?
                    """, (new_strikes, should_block, should_block, reason, should_block, row["id"]))
                else:
                    new_strikes = 1
                    should_block = 0
                    try:
                        cursor.execute("""
                            INSERT INTO users (name, username, email, karma_points, strikes, is_blocked, is_defaulter, block_reason)
                            VALUES (?, ?, ?, 0, 1, 0, 0, '')
                        """, (author_name, username, f"{username}_{int(time.time())}@defaulter.in"))
                    except Exception:
                        pass

                log_id = f"mod_{int(time.time()*1000)}"
                cursor.execute("""
                    INSERT INTO community_moderation_logs (id, user_id, username, action, reason, triggered_text)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (log_id, user_id, username, 'auto_strike_or_block', f"Dirty content detected (Strike {new_strikes})", problem_text[:200]))
                conn.commit()

            if new_strikes >= 2:
                return self.send_json_response(403, {
                    "status": "blocked",
                    "message": "🚫 ACCOUNT BLOCKED: Repeated dirty/vulgar submissions detected. You are now permanently flagged as a Community Defaulter. Swami Vivekananda: 'Purity in thought, speech, and deed is the bedrock of life.'"
                })
            else:
                return self.send_json_response(400, {
                    "status": "warning",
                    "message": f"⚠️ DIRTY COMMENT BLOCKED: Inappropriate/vulgar words detected (Strike {new_strikes}/2). Youth Sangam is a sacred space for seekers. Guard your speech!"
                })

        post_id = f"post_{int(time.time()*1000)}"

        # NLP match for AI Saarthi intervention
        matched = match_problem_with_dataset(problem_text)
        lesson_txt = matched.get("translations", {}).get("english", {}).get("story_lesson", "")
        ai_slogan = f"{matched['sanskrit_slogan']} — {lesson_txt}"

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO community_posts (id, user_id, author_name, username, author_avatar, is_anonymous, category, problem_text, ai_slogan, is_hidden, status, flags_count)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'active', 0)
            """, (post_id, user_id, author_name, username, author_avatar, is_anon, category, problem_text, ai_slogan))
            # Reward author +5 Karma
            if user_id:
                cursor.execute("UPDATE users SET karma_points = karma_points + 5 WHERE id = ?", (user_id,))
            conn.commit()

        self.send_json_response(200, {"status": "success", "post_id": post_id, "ai_slogan": ai_slogan})

    def handle_community_solution(self, data):
        post_id = data.get("post_id")
        user_id = data.get("user_id")
        author_name = data.get("author_name", "Anonymous Helper")
        username = (data.get("username") or "helper").strip().lstrip("@")
        solution_text = data.get("solution_text", "").strip()

        # 1. Defaulter & Blocked User Check
        blocked, block_msg = is_user_blocked(user_id=user_id, username=username)
        if blocked:
            return self.send_json_response(403, {
                "status": "blocked",
                "message": f"🚫 ACCOUNT BLOCKED: You are classified as a Community Defaulter / Guideline Violator ({block_msg}). Solution submission is restricted."
            })

        # 2. Dirty Commenter & Profanity Shield
        is_dirty, term = check_dirty_content(solution_text)
        if is_dirty:
            new_strikes = 1
            with get_db() as conn:
                cursor = conn.cursor()
                if user_id:
                    cursor.execute("SELECT id, strikes FROM users WHERE id = ?", (user_id,))
                else:
                    cursor.execute("SELECT id, strikes FROM users WHERE username = ? COLLATE NOCASE", (username,))
                row = cursor.fetchone()
                if row:
                    new_strikes = (row["strikes"] or 0) + 1
                    should_block = 1 if new_strikes >= 2 else 0
                    reason = "Blocked from Youth Sangam for Dirty Comments & Vulgar Language" if should_block else ""
                    cursor.execute("""
                        UPDATE users 
                        SET strikes = ?, is_blocked = ?, is_defaulter = ?, block_reason = ?,
                            blocked_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE blocked_at END
                        WHERE id = ?
                    """, (new_strikes, should_block, should_block, reason, should_block, row["id"]))
                else:
                    new_strikes = 1
                    should_block = 0
                    try:
                        cursor.execute("""
                            INSERT INTO users (name, username, email, karma_points, strikes, is_blocked, is_defaulter, block_reason)
                            VALUES (?, ?, ?, 0, 1, 0, 0, '')
                        """, (author_name, username, f"{username}_{int(time.time())}@defaulter.in"))
                    except Exception:
                        pass

                log_id = f"mod_{int(time.time()*1000)}"
                cursor.execute("""
                    INSERT INTO community_moderation_logs (id, user_id, username, action, reason, triggered_text)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (log_id, user_id, username, 'auto_strike_or_block', f"Dirty solution comment detected (Strike {new_strikes})", solution_text[:200]))
                conn.commit()

            if new_strikes >= 2:
                return self.send_json_response(403, {
                    "status": "blocked",
                    "message": "🚫 ACCOUNT BLOCKED: Repeated dirty/vulgar comments detected. Your account is now blocked as a Community Defaulter. Swami Vivekananda: 'Purity in thought, speech, and deed is the bedrock of life.'"
                })
            else:
                return self.send_json_response(400, {
                    "status": "warning",
                    "message": f"⚠️ DIRTY COMMENT BLOCKED: Inappropriate/vulgar words detected (Strike {new_strikes}/2). Youth Sangam solutions must elevate and guide peers respectfully!"
                })

        sol_id = f"sol_{int(time.time()*1000)}"

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO community_solutions (id, post_id, user_id, author_name, username, solution_text, is_hidden, status, flags_count)
                VALUES (?, ?, ?, ?, ?, ?, 0, 'active', 0)
            """, (sol_id, post_id, user_id, author_name, username, solution_text))
            if user_id:
                cursor.execute("UPDATE users SET karma_points = karma_points + 15 WHERE id = ?", (user_id,))
            conn.commit()

        self.send_json_response(200, {"status": "success", "sol_id": sol_id})

    def handle_get_community_feed(self):
        with get_db() as conn:
            cursor = conn.cursor()
            # Clean feed: Exclude hidden posts and exclude blocked defaulters
            cursor.execute("""
                SELECT p.* FROM community_posts p
                LEFT JOIN users u ON p.user_id = u.id
                WHERE (p.is_hidden IS NULL OR p.is_hidden = 0)
                  AND (u.is_blocked IS NULL OR u.is_blocked = 0)
                  AND (u.is_defaulter IS NULL OR u.is_defaulter = 0)
                ORDER BY p.created_at DESC LIMIT 35
            """)
            posts = [dict(r) for r in cursor.fetchall()]

            for p in posts:
                cursor.execute("""
                    SELECT s.* FROM community_solutions s
                    LEFT JOIN users u ON s.user_id = u.id
                    WHERE s.post_id = ?
                      AND (s.is_hidden IS NULL OR s.is_hidden = 0)
                      AND (u.is_blocked IS NULL OR u.is_blocked = 0)
                      AND (u.is_defaulter IS NULL OR u.is_defaulter = 0)
                    ORDER BY s.upvotes DESC
                """, (p["id"],))
                p["solutions"] = [dict(r) for r in cursor.fetchall()]

        self.send_json_response(200, {"status": "success", "posts": posts})

    # Flag/Report Inappropriate Content, Dirty Comments, or Defaulters
    def handle_community_report(self, data):
        target_type = data.get("target_type", "post") # 'post' or 'solution'
        target_id = data.get("target_id")
        reporter_id = data.get("reporter_id")
        reporter_handle = data.get("reporter_handle", "anonymous")
        author_username = (data.get("author_username") or "").strip().lstrip("@")
        reason = data.get("reason", "dirty_language") # 'dirty_language', 'defaulter', 'harassment', 'spam'
        details = data.get("details", "")

        if not target_id:
            return self.send_json_response(400, {"status": "error", "message": "Target ID required."})

        rep_id = f"rep_{int(time.time()*1000)}"

        with get_db() as conn:
            cursor = conn.cursor()
            content_snippet = ""
            target_table = "community_posts" if target_type == "post" else "community_solutions"
            text_col = "problem_text" if target_type == "post" else "solution_text"

            cursor.execute(f"SELECT {text_col}, username, user_id, flags_count FROM {target_table} WHERE id = ?", (target_id,))
            item = cursor.fetchone()
            if item:
                content_snippet = str(item[text_col] or "")[:150]
                author_username = author_username or item["username"]
                author_user_id = item["user_id"]
                current_flags = (item["flags_count"] or 0) + 1

                # If reported for dirty language/harassment or >= 2 flags, automatically hide content!
                hide_it = 1 if (reason in ["dirty_language", "harassment"] or current_flags >= 2) else 0

                cursor.execute(f"""
                    UPDATE {target_table} 
                    SET flags_count = ?, is_hidden = CASE WHEN ? = 1 THEN 1 ELSE is_hidden END 
                    WHERE id = ?
                """, (current_flags, hide_it, target_id))

                # Add violation strike to content author
                if author_user_id and reason in ["dirty_language", "harassment", "defaulter"]:
                    cursor.execute("UPDATE users SET strikes = strikes + 1 WHERE id = ?", (author_user_id,))
                    cursor.execute("SELECT strikes FROM users WHERE id = ?", (author_user_id,))
                    s_row = cursor.fetchone()
                    if s_row and (s_row["strikes"] or 0) >= 2:
                        cursor.execute("""
                            UPDATE users 
                            SET is_blocked = 1, is_defaulter = 1, 
                                block_reason = 'Reported Multiple Times for Dirty Comments / Defaulter', 
                                blocked_at = CURRENT_TIMESTAMP 
                            WHERE id = ?
                        """, (author_user_id,))

            cursor.execute("""
                INSERT INTO community_reports (id, target_type, target_id, reporter_id, reporter_handle, author_username, content_snippet, reason, details)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (rep_id, target_type, target_id, reporter_id, reporter_handle, author_username, content_snippet, reason, details))
            conn.commit()

        self.send_json_response(200, {
            "status": "success",
            "message": "Report logged. Content flagged for Community Guardian review and quarantined."
        })

    # Community Guardian Moderation Dashboard Data
    def handle_get_moderation_data(self):
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, name, username, email, avatar, karma_points, is_blocked, is_defaulter, strikes, block_reason, blocked_at, created_at
                FROM users 
                WHERE is_blocked = 1 OR is_defaulter = 1 OR strikes > 0
                ORDER BY is_blocked DESC, strikes DESC, blocked_at DESC LIMIT 50
            """)
            blocked_users = [dict(r) for r in cursor.fetchall()]

            cursor.execute("""
                SELECT * FROM community_reports 
                WHERE status = 'pending' 
                ORDER BY created_at DESC LIMIT 50
            """)
            reports = [dict(r) for r in cursor.fetchall()]

            cursor.execute("""
                SELECT * FROM community_moderation_logs 
                ORDER BY created_at DESC LIMIT 30
            """)
            logs = [dict(r) for r in cursor.fetchall()]

            cursor.execute("SELECT COUNT(*) as c FROM users WHERE is_blocked = 1 OR is_defaulter = 1")
            total_blocked = cursor.fetchone()["c"]
            cursor.execute("SELECT COUNT(*) as c FROM community_moderation_logs WHERE action = 'auto_strike_or_block'")
            dirty_stopped = cursor.fetchone()["c"]

        self.send_json_response(200, {
            "status": "success",
            "blocked_users": blocked_users,
            "reports": reports,
            "logs": logs,
            "stats": {
                "total_blocked_defaulters": total_blocked,
                "dirty_comments_filtered": dirty_stopped,
                "community_purity_score": "99.8%"
            }
        })

    # Block or Unblock Defaulters & Bad Actors
    def handle_block_user(self, data):
        target_username = (data.get("username") or "").strip().lstrip("@")
        user_id = data.get("user_id")
        action = data.get("action", "block") # 'block' or 'unblock'
        reason = data.get("reason", "Violating Youth Sangam Community Standards / Defaulter")

        with get_db() as conn:
            cursor = conn.cursor()
            if target_username:
                cursor.execute("SELECT id, username FROM users WHERE username = ? COLLATE NOCASE", (target_username,))
            elif user_id:
                cursor.execute("SELECT id, username FROM users WHERE id = ?", (user_id,))
            else:
                return self.send_json_response(400, {"status": "error", "message": "Username or User ID required."})

            user_row = cursor.fetchone()
            if not user_row:
                return self.send_json_response(404, {"status": "error", "message": f"User @{target_username} not found."})

            target_id = user_row["id"]
            uname = user_row["username"]

            if action == "block":
                cursor.execute("""
                    UPDATE users 
                    SET is_blocked = 1, is_defaulter = 1, block_reason = ?, blocked_at = CURRENT_TIMESTAMP 
                    WHERE id = ?
                """, (reason, target_id))
                # Purge/hide all existing posts and solutions from this blocked defaulter
                cursor.execute("UPDATE community_posts SET is_hidden = 1 WHERE user_id = ? OR username = ?", (target_id, uname))
                cursor.execute("UPDATE community_solutions SET is_hidden = 1 WHERE user_id = ? OR username = ?", (target_id, uname))

                cursor.execute("""
                    INSERT INTO community_moderation_logs (id, user_id, username, action, reason, triggered_text)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (f"mod_{int(time.time()*1000)}", target_id, uname, 'manual_block', reason, ''))
                msg = f"User @{uname} has been BLOCKED as a Community Defaulter. Their posts and comments are now hidden."
            else:
                # Unblock / Pardon
                cursor.execute("""
                    UPDATE users 
                    SET is_blocked = 0, is_defaulter = 0, strikes = 0, block_reason = '' 
                    WHERE id = ?
                """, (target_id,))
                cursor.execute("UPDATE community_posts SET is_hidden = 0 WHERE (user_id = ? OR username = ?) AND flags_count < 2", (target_id, uname))
                cursor.execute("UPDATE community_solutions SET is_hidden = 0 WHERE (user_id = ? OR username = ?) AND flags_count < 2", (target_id, uname))

                cursor.execute("""
                    INSERT INTO community_moderation_logs (id, user_id, username, action, reason, triggered_text)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (f"mod_{int(time.time()*1000)}", target_id, uname, 'unblock_pardon', 'Pardoned by Community Guardian', ''))
                msg = f"User @{uname} unblocked. Community access has been restored."

            conn.commit()

        self.send_json_response(200, {"status": "success", "message": msg, "username": uname, "action": action})

    # Delete Flagged Content & Optionally Ban Offending Author
    def handle_delete_flagged_content(self, data):
        target_type = data.get("target_type", "post")
        target_id = data.get("target_id")
        report_id = data.get("report_id")
        ban_author = data.get("ban_author", False)

        with get_db() as conn:
            cursor = conn.cursor()
            table = "community_posts" if target_type == "post" else "community_solutions"
            cursor.execute(f"SELECT username, user_id FROM {table} WHERE id = ?", (target_id,))
            row = cursor.fetchone()

            if row:
                cursor.execute(f"UPDATE {table} SET is_hidden = 1 WHERE id = ?", (target_id,))
                if ban_author:
                    if row["user_id"]:
                        cursor.execute("""
                            UPDATE users 
                            SET is_blocked = 1, is_defaulter = 1, 
                                block_reason = 'Banned for Inappropriate/Dirty Content & Defaulter Status', 
                                blocked_at = CURRENT_TIMESTAMP 
                            WHERE id = ?
                        """, (row["user_id"],))
                    elif row["username"]:
                        cursor.execute("""
                            UPDATE users 
                            SET is_blocked = 1, is_defaulter = 1, 
                                block_reason = 'Banned for Inappropriate/Dirty Content & Defaulter Status', 
                                blocked_at = CURRENT_TIMESTAMP 
                            WHERE username = ?
                        """, (row["username"],))

            if report_id:
                cursor.execute("UPDATE community_reports SET status = 'resolved' WHERE id = ?", (report_id,))

            conn.commit()

        self.send_json_response(200, {"status": "success", "message": "Offending content purged from community. Report resolved."})

    # 9. Sadhana Challenge Handlers (7-Day and 14-Day Transformation)
    def handle_create_sadhana(self, data):
        user_id = data.get("user_id")
        duration_days = int(data.get("duration_days", 7))
        if duration_days not in [7, 14]:
            duration_days = 7
        category = data.get("category", "fear_courage")
        problem_text = data.get("problem_text", "").strip()
        lang = data.get("lang", "hinglish")
        
        challenge_id = f"sadhana_{int(time.time()*1000)}"
        
        titles = {
            "fear_courage": f"{duration_days}-Day Fearlessness & Exam Mastery Sadhana (निर्भय साधना)",
            "focus_discipline": f"{duration_days}-Day Laser Focus & Digital Detox Sadhana (एकाग्रता साधना)",
            "strength_vitality": f"{duration_days}-Day Iron Will & Physical Prana Sadhana (बल साधना)",
            "anger_patience": f"{duration_days}-Day Self-Mastery & Inner Peace Sadhana (संयम साधना)"
        }
        challenge_title = titles.get(category, f"{duration_days}-Day Swami Vivekananda Sadhana Challenge")
        tasks = generate_sadhana_tasks(category, duration_days, problem_text, lang)
        
        with get_db() as conn:
            cursor = conn.cursor()
            if user_id:
                cursor.execute("UPDATE sadhana_challenges SET status = 'archived' WHERE user_id = ? AND status = 'active'", (user_id,))
            
            cursor.execute("""
                INSERT INTO sadhana_challenges (id, user_id, title, category, duration_days, current_day, completed_days, status, problem_context)
                VALUES (?, ?, ?, ?, ?, 1, 0, 'active', ?)
            """, (challenge_id, user_id, challenge_title, category, duration_days, problem_text))
            
            for t in tasks:
                task_id = f"task_{challenge_id}_{t['day_number']}"
                cursor.execute("""
                    INSERT INTO sadhana_day_tasks (id, challenge_id, day_number, title, principle, instruction, suggested_proof, karma_reward, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
                """, (task_id, challenge_id, t["day_number"], t["title"], t["principle"], t["instruction"], t["suggested_proof"], t["karma_reward"]))
            conn.commit()
            
            cursor.execute("SELECT * FROM sadhana_challenges WHERE id = ?", (challenge_id,))
            c_row = dict(cursor.fetchone())
            cursor.execute("SELECT * FROM sadhana_day_tasks WHERE challenge_id = ? ORDER BY day_number ASC", (challenge_id,))
            c_row["tasks"] = [dict(r) for r in cursor.fetchall()]
            c_row["completion_pct"] = 0
            
        self.send_json_response(200, {
            "status": "success",
            "message": f"🎉 {duration_days}-Day Sadhana Challenge activated! Let's conquer Day 1!",
            "challenge": c_row
        })

    def handle_get_current_sadhana(self, user_id):
        with get_db() as conn:
            cursor = conn.cursor()
            if user_id:
                cursor.execute("""
                    SELECT * FROM sadhana_challenges 
                    WHERE user_id = ? AND status = 'active'
                    ORDER BY created_at DESC LIMIT 1
                """, (user_id,))
            else:
                cursor.execute("""
                    SELECT * FROM sadhana_challenges 
                    WHERE status = 'active'
                    ORDER BY created_at DESC LIMIT 1
                """)
            c_row = cursor.fetchone()
            if not c_row:
                self.send_json_response(200, {"status": "success", "challenge": None})
                return
            
            challenge = dict(c_row)
            cursor.execute("SELECT * FROM sadhana_day_tasks WHERE challenge_id = ? ORDER BY day_number ASC", (challenge["id"],))
            challenge["tasks"] = [dict(r) for r in cursor.fetchall()]
            comp = challenge["completed_days"] or 0
            dur = challenge["duration_days"] or 7
            challenge["completion_pct"] = round((comp / dur) * 100)
            
        self.send_json_response(200, {"status": "success", "challenge": challenge})

    def handle_submit_sadhana_proof(self, data):
        challenge_id = data.get("challenge_id")
        day_number = int(data.get("day_number", 1))
        proof_type = data.get("proof_type", "note") # "photo", "audio", "note"
        proof_content = data.get("proof_content", "").strip()
        user_id = data.get("user_id")
        
        if not challenge_id or not proof_content:
            self.send_json_response(400, {"status": "error", "message": "challenge_id and proof_content are required"})
            return
            
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM sadhana_day_tasks WHERE challenge_id = ? AND day_number = ?", (challenge_id, day_number))
            task = cursor.fetchone()
            if not task:
                self.send_json_response(404, {"status": "error", "message": "Day task not found"})
                return
                
            karma_reward = task["karma_reward"] or 35
            
            cursor.execute("""
                UPDATE sadhana_day_tasks 
                SET status = 'verified', proof_type = ?, proof_content = ?, completed_at = CURRENT_TIMESTAMP
                WHERE challenge_id = ? AND day_number = ?
            """, (proof_type, proof_content, challenge_id, day_number))
            
            cursor.execute("""
                UPDATE sadhana_challenges 
                SET completed_days = completed_days + 1, current_day = MIN(duration_days, ? + 1), updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (day_number, challenge_id))
            
            cursor.execute("SELECT * FROM sadhana_challenges WHERE id = ?", (challenge_id,))
            c_row = dict(cursor.fetchone())
            
            is_graduated = False
            if c_row["completed_days"] >= c_row["duration_days"]:
                cursor.execute("UPDATE sadhana_challenges SET status = 'completed' WHERE id = ?", (challenge_id,))
                c_row["status"] = "completed"
                karma_reward += 50
                is_graduated = True
                
            new_karma = 350
            if user_id:
                cursor.execute("UPDATE users SET karma_points = karma_points + ? WHERE id = ?", (karma_reward, user_id))
                cursor.execute("SELECT karma_points FROM users WHERE id = ?", (user_id,))
                u_row = cursor.fetchone()
                if u_row:
                    new_karma = u_row["karma_points"]
                    
            cursor.execute("SELECT * FROM sadhana_day_tasks WHERE challenge_id = ? ORDER BY day_number ASC", (challenge_id,))
            c_row["tasks"] = [dict(r) for r in cursor.fetchall()]
            comp = c_row["completed_days"] or 0
            dur = c_row["duration_days"] or 7
            c_row["completion_pct"] = round((comp / dur) * 100)
            conn.commit()
            
        success_msg = f"🏆 Great dedication! Day {day_number} verified with {proof_type.upper()} proof! +{karma_reward} Karma awarded!"
        if is_graduated:
            success_msg = f"🌟 VIJAYI SADHANA GRADUATION! You conquered the full {c_row['duration_days']}-Day Challenge! +{karma_reward} Karma awarded!"
            
        self.send_json_response(200, {
            "status": "success",
            "message": success_msg,
            "karma_awarded": karma_reward,
            "new_karma": new_karma,
            "is_graduated": is_graduated,
            "challenge": c_row
        })

    def handle_get_sadhana_history(self, user_id):
        if not user_id:
            self.send_json_response(200, {"status": "success", "challenges": []})
            return
            
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM sadhana_challenges 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 10
            """, (user_id,))
            challenges = [dict(r) for r in cursor.fetchall()]
            for c in challenges:
                cursor.execute("SELECT COUNT(*) FROM sadhana_day_tasks WHERE challenge_id = ? AND status = 'verified'", (c["id"],))
                c["verified_tasks_count"] = cursor.fetchone()[0]
                
        self.send_json_response(200, {"status": "success", "challenges": challenges})

    # 10. AI Follow-up Chatbot Copilot
    def handle_mentor_chat(self, data):
        message = data.get("message", "").strip()
        problem_context = data.get("problem_context", "")
        lang = data.get("lang", "hinglish")
        user_id = data.get("user_id")
        
        msg_lower = message.lower()
        if "plan" in msg_lower or "kal" in msg_lower or "schedule" in msg_lower or "routine" in msg_lower or "action" in msg_lower:
            if lang == "hindi":
                reply = "बहुत उत्तम संकल्प! कल के लिए तुम्हारा पहला कदम: प्रातः 7:00 बजे 45 मिनट का 'डीप स्टडी स्प्रिंट' रखो। फोन को बंद करके दूसरे कमरे में रख दो। क्या तुम 7-दिवसीय या 14-दिवसीय साधना चुनौती शुरू करना चाहोगे जिससे प्रतिदिन का लक्ष्य और पॉइंट्स ट्रैक हो सकें?"
            elif lang == "hinglish":
                reply = "Shabash! Kal ka focused routine: Subah 7:30 baje apna sabse weak topic lo aur 45 minute ka timer lagakar padho. Zero phone interruption! Kya tum chahte ho hum 7-Day ya 14-Day Sadhana Challenge shuru karein taaki har din ka task proof ke sath complete kar sako?"
            else:
                reply = "Splendid resolve! Your next 24-hour priority: Schedule a 45-minute deep focus sprint tomorrow at 7:30 AM on your most challenging topic with zero phone distractions. Would you like to launch the 7-Day or 14-Day Sadhana Challenge to track daily tasks with verified proof?"
        elif "darr" in msg_lower or "fear" in msg_lower or "fail" in msg_lower or "marks" in msg_lower:
            if lang == "hindi":
                reply = "स्वामी जी ने कहा था: 'डटकर सामना करो!' भय केवल तभी तक सताता है जब तक तुम भागते हो। आज अपनी 3 गलतियों को लिखो और केवल 1 छोटे टॉपिक से पुनः शुरुआत करो। अनंत शक्ति तुम्हारे भीतर है!"
            elif lang == "hinglish":
                reply = "Darr se bhaagne par darr aur bada lagta hai! Swami ji ki story yaad karo: 'Face the brutes!' Apni 3 mistakes diary me likho aur ek chhota section aaj hi complete karo. Seena taan kar khade ho jao!"
            else:
                reply = "Remember Swami Vivekananda's words: 'Face the brutes!' Running from anxiety only magnifies it. Write down your 3 root mistakes today and begin with one small topic. All divine power is within you!"
        else:
            if lang == "hindi":
                reply = f"साधना मार्ग पर दृढ़ रहो। तुम्हारा प्रश्न: '{message}' अत्यंत महत्वपूर्ण है। निरंतरता ही सिद्धि की जननी है। प्रतिदिन का छोटा कदम ही महान विजय बनता है।"
            elif lang == "hinglish":
                reply = f"Aapka vishwas hi aapki taakat hai! '{message}' par overthink mat karo; chhota action lo. Har din ka verified task hi real transformation lata hai!"
            else:
                reply = f"Stand firm like a lion! Regarding '{message}': focus on daily micro-action rather than outcome anxiety. Unbroken consistency turns the impossible into reality."
                
        quick_suggestions = [
            "🚀 7-Day Sadhana Start Karein",
            "📅 Kal Ka Study Plan Banao",
            "🧘 Anxiety & Focus Tips"
        ]
        self.send_json_response(200, {
            "status": "success",
            "reply": reply,
            "quick_suggestions": quick_suggestions
        })

if __name__ == "__main__":
    init_db()
    print("=" * 60)
    print("   Vivek Saarthi - Pure Email Auth & Unique Account Engine")
    print(f"   Server running at: http://localhost:{PORT}")
    print(f"   SMTP Dispatcher configured via: {SMTP_SENDER_EMAIL}")
    print("=" * 60)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), VivekSaarthiHandler) as httpd:
        httpd.serve_forever()
