<div align="center">

<br/>

<pre>
██╗████████╗███████╗██████╗       ███╗   ██╗ █████╗ ████████╗██╗ ██████╗ ███╗   ██╗
██║╚══██╔══╝██╔════╝██╔══██╗      ████╗  ██║██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║
██║   ██║   █████╗  ██████╔╝      ██╔██╗ ██║███████║   ██║   ██║██║   ██║██╔██╗ ██║
██║   ██║   ██╔══╝  ██╔══██╗      ██║╚██╗██║██╔══██║   ██║   ██║██║   ██║██║╚██╗██║
██║   ██║   ███████╗██║  ██║      ██║ ╚████║██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║
╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝      ╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
</pre>

### 🌍 AI-Powered End-to-End Group Travel Manager

*Plan smarter. Travel safer. Discover beyond the obvious.*

<br/>

[![Status](https://img.shields.io/badge/STATUS-ACTIVE%20DEVELOPMENT-22c55e?style=for-the-badge&logoColor=white)](.)
[![AI](https://img.shields.io/badge/AI-MULTI--AGENT%20SYSTEM-8b5cf6?style=for-the-badge&logoColor=white)](.)
[![Build](https://img.shields.io/badge/BUILD-IN%20PROGRESS-f59e0b?style=for-the-badge&logoColor=white)](.)

<br/>

---

</div>

## 📌 Table of Contents

- 🧭 What is Iternation?
- 💥 The Problem We're Solving
- 🎯 Project Objectives
- 🤖 Multi-Agent AI System
- ✨ Key Features
- 📋 Scope & Control
- ✅ Acceptance Criteria
- 👥 Team & Roles
- 🔧 Tech Stack & Dependencies
- 📖 Glossary

---

## 🧭 What is Iternation?

**Iternation** is an AI-driven, end-to-end travel management platform built to eliminate the chaos of group travel planning. Whether you're heading out with 2 friends or 20, Iternation brings everything — itineraries, expenses, safety, documents, and discovery — under one intelligent roof.

> *"Stop juggling 5 apps. Start travelling."*

No more lost WhatsApp threads. No more spreadsheet headaches. No more awkward bill splits. **Iternation is your entire trip, managed by AI.**

---

## 💥 The Problem We're Solving

Group travel planning is broken. Here's what people deal with today:

| Pain Point | Current Workaround | Why It Fails |
|---|---|---|
| 🗺️ Itinerary coordination | Google Docs / Notion | No AI, no collaboration, no real-time sync |
| 💬 Group communication | WhatsApp groups | Chaotic, easily lost context |
| 💸 Expense tracking | Splitwise / Spreadsheets | Disconnected from the trip |
| 🏨 Booking management | Email threads | Documents scattered everywhere |
| 📁 Document storage | Personal drives | No shared, secure access |
| 🔍 Discovering places | Instagram / blogs | No safety context, no personalization |
| 🛡️ Safety information | None | Completely ignored in planning |

**The result?** Wasted time, missed experiences, group conflicts, and stressful trips.

**Iternation fixes all of it — in one platform.**

---

## 🎯 Project Objectives

The core mission of Iternation is to build an **AI-powered travel management platform** that helps users plan, organize, and execute trips smoothly — without confusion or manual effort.

### 🔑 Key Objectives

```
 🤖  Automate Trip Planning      →  AI-based itinerary creation with day-wise scheduling
 👥  Collaborative Management   →  Invite friends via email joining links
 🧠  Multi-Agent AI Assistance  →  Dedicated agents for activities, transport & stays
 🛡️  Safety-Aware Travel        →  Safety ratings using reviews and live road data
 💎  Hidden Gems Discovery      →  Community-driven validation through voting
 💰  Smart Expense Splitting    →  Equal/custom splits with minimum transaction logic
 📁  Centralized Document Vault →  Secure shared storage for tickets & bookings
 🔄  End-to-End Execution       →  Covers everything from planning to post-trip feedback
```

---

## 🤖 Multi-Agent AI System

Iternation doesn't use a single AI — it deploys a **fleet of specialized AI agents**, each an expert in its domain:

```
┌─────────────────────────────────────────────────────────────────────┐                
│                     ITERNATION AI BRAIN                             │
│                                                                     │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐   │
│   │    PLACE    │  │ TRANSPORT   │  │    STAY     │  │  SAFETY  │   │   
│   │    AGENT    │  │    AGENT    │  │    AGENT    │  │  AGENT   │   │
│   ├─────────────┤  ├─────────────┤  ├─────────────┤  ├──────────┤   │
│   │ Suggests    │  │ Recommends  │  │ Finds best  │  │ Scores   │   │
│   │ activities  │  │ cab/train/  │  │ hotels by   │  │ places   │   │
│   │ & places    │  │ bus/walk    │  │ budget &    │  │ using    │   │
│   │ based on    │  │ + best path │  │ ratings     │  │ reviews  │   │
│   │ interests   │  │ to take     │  │             │  │ & alerts │   │
│   │             │  │             │  │             │  │          │   │
│   │ DistilBERT  │  │ Decision    │  │ Google      │  │ Review   │   │
│   │ Fine-tuned  │  │ Tree Model  │  │ Places API  │  │ + Road   │   │
│   └─────────────┘  └─────────────┘  └─────────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 🔐 1. Authentication System
Secure user registration and login with **JWT-based authentication**.
- Email + password login
- Stateless session management
- Secure token generation on every login

---

### 📧 2. Email-Based Trip Invitation
Trip creators can **invite collaborators** with a single click.
- Unique joining links sent via SMTP
- Friends join the trip by clicking the link
- Role-based access (admin / member)

---

### 📅 3. Day-wise Itinerary Builder
Build structured, **time-slotted itineraries** for every day of the trip.
- Create days and individual time slots
- AI populates activities per slot
- Drag-and-rearrange support
- Collaborative editing for all trip members

---

### 🤖 4. AI Place Suggestion Agent
Powered by a **fine-tuned DistilBERT model** integrated with Google Places API.
- Learns from user interests and trip destination
- Suggests relevant attractions, food spots, and experiences
- Weather-aware recommendations

---

### 🚗 5. Transport Suggestion Agent
Never wonder "how do we get there?" again.
- Compares cab / train / bus / walking options
- Uses a **Decision Tree Classifier** trained on distance, cost, and convenience
- Integrated with Google Maps API for live routing

---

### 🛡️ 6. Safety Analysis Engine
Know before you go. Every suggested place gets a **Safety Score**.
- Aggregates user reviews, road closure data, and alert feeds
- Displays safety warnings inline in the itinerary
- Helps groups make informed, risk-aware decisions

---

### 💎 7. Hidden Gems Discovery System
Find places the internet hasn't discovered yet.
- Any user can **submit a hidden gem**
- Community votes to validate submissions
- Verified gems get featured in AI suggestions
- Builds a growing, crowdsourced travel knowledge base

---

### 💸 8. Smart Expense Splitter
Group finances, sorted.
- Add group expenses with one payer
- Support for **equal splits** or **custom splits**
- Uses a **graph-based minimum transaction settlement algorithm** to reduce the number of payments needed
- Clear dashboard showing who owes whom

---

### 📁 9. Centralized Document Vault
No more "where's the hotel booking?"
- Upload tickets, bookings, passes, and permits
- Stored securely on **cloud storage**
- Accessible to all trip members at any time

---

### 💬 10. Real-Time Trip Chat
Coordinate without leaving the app.
- **WebSocket-powered** real-time messaging
- Trip-specific chat rooms
- Instant message delivery to all members

---


### Component Breakdown

| Layer | Technology | Responsibility |
|---|---|---|
| **UI/UX** | React | Responsive, device-agnostic interface |
| **Frontend** | React.js | Component-based UI, state management, accessibility |
| **Backend** | Node.js + Express | Auth, REST APIs, DB schema, ML model integration |
| **ML Layer** | FastAPI + Python | DistilBERT, Decision Tree, Safety Engine |
| **Database** | PostgreSQL | Relational storage for all trip, user, and expense data |
| **Storage** | Cloudinary | Secure cloud storage for documents and media |
| **Auth** | JWT | Stateless, secure session management |
| **Real-time** | WebSockets | Instant trip chat delivery |
| **Email** | SMTP | Trip invitations |

---

### Core Tables

| Table | Key Fields | Purpose |
|---|---|---|
| `users` | id, name, email, password, trip_id[] | Core user accounts |
| `trip_data` | id, name, destination, start_date, end_date, budget | Trip records |
| `trip_member` | id, trip_id, email, role, status, invite_token | Collaboration |
| `itinerary_data` | id, trip_id, destination | Itinerary containers |
| `day_data` | id, itinerary_id, day_index | Per-day breakdown |
| `slot_data` | id, day_id, start_time, end_time, activity, status | Time slots |
| `expense_data` | id, trip_id, name, users[], price, paid_by | Expense records |
| `expense_settlement` | id, trip_id, payer_id, receiver_id, amount, status | Settlements |
| `document_data` | id, trip_id, file_url, file_type, user_id | Document vault |
| `place_suggestion` | id, trip_id, suggested_by, city_name, place_name, status | AI suggestions |
| `user_expense` | id, trip_id, total_balance | Balance tracker |

---

## 📋 Scope & Control

### ✅ In Scope

- User authentication and trip creation
- Email-based trip invitation system
- Day-wise itinerary builder with time slots
- AI agents for activities, hotels, and transport
- Safety rating based on reviews and road conditions
- Hidden gem suggestion and community voting
- Expense splitting with transaction minimization
- Secure trip document storage (Cloudinary)
- Member dashboard and real-time chat

### ❌ Out of Scope

- Direct flight/hotel booking inside the platform
- Multi-language support
- Offline access
- Live emergency monitoring

### 📌 Assumptions

- Users will have active internet access during planning
- Google Maps, Places, and road safety APIs remain accessible
- Users will upload valid documents and bookings
- Hidden gem contributions will be community-moderated
- AI suggestions will support — not replace — human decision-making

---

## ✅ Acceptance Criteria

| Feature | Acceptance Condition |
|---|---|
| 🔐 **Trip Creation** | User can create a trip successfully with all details |
| 📧 **Email Invite** | Friend joins by clicking the invite link and becomes a member |
| 🤖 **AI Suggestions** | Activities and hotels displayed based on user interests |
| 🛡️ **Safety Score** | Every suggested place shows a computed safety rating |
| 💸 **Expense Split** | Balances are correctly calculated per member |
| 🔁 **Minimum Transactions** | Optimized minimum settlement is generated |
| 📁 **Document Upload** | Uploaded tickets & files are accessible to all trip members |
| 💎 **Hidden Gems Voting** | Gems become verified after reaching the vote threshold |
| 💬 **Real-time Chat** | All members receive messages instantly via WebSocket |

---
## 👥 Team & Roles
 
| Member | Role | Responsibilities | Key Skills |
|---|---|---|---|
| **Om Dutt Pandey** | Product Lead | Scope definition, backlog management, feature reviews | Product Management, APIs | 8 hrs/wk |
| **Om, Anuj, Rahul** | Backend | Architecture design, APIs, Security | Node.js, PostgreSQL | 10 hrs/wk | anuj.saxena_cs.aiml23@gla.ac.in |
| **Om, Anuj, Rahul** | Frontend | React UI, State Management, Accessibility | React.js, TailwindCss | 10 hrs/wk | rahul.gautam_cs.aiml23@gla.ac.in |
| **Rahul Gautam**| QA & Docs | Test planning, end-to-end testing, documentation | Playwright, Technical Writing | 8 hrs/wk | — |
 
---

## 🔧 Tech Stack & Dependencies

### Frontend
```
React.js          →  Component-based UI framework
State Management  →  Context API / Redux
Responsiveness    →  CSS Flexbox + Grid
```

### Backend
```
Node.js + Express  →  REST API server
FastAPI (Python)   →  ML model serving layer
JWT                →  Authentication tokens
WebSockets         →  Real-time chat
SMTP               →  Email invitation service
```

### AI / Machine Learning
```
DistilBERT         →  Fine-tuned for place suggestion (NLP)
Decision Tree      →  Transport mode classification
TensorFlow/PyTorch →  Model training & inference
Transformers       →  Hugging Face pre-trained models
```

### Database & Storage
```
PostgreSQL         →  Primary relational database
Cloudinary         →  Cloud storage for documents & media
```

### External APIs
```
Google Maps API    →  Routing and navigation
OpenTripMap API  →  Place details and discovery
Road Alerts API    →  Safety and road condition data
```

---

## 📖 Glossary

| Term | Definition |
|---|---|
| **AI Agent** | An intelligent sub-system that performs a specific travel recommendation task autonomously |
| **Safety Rating** | A computed score derived from aggregated user reviews and live road alert data |
| **Expense Settlement** | An optimized, graph-based minimal transaction balancing system for group expenses |
| **Hidden Gem** | A lesser-known, user-discovered travel spot submitted and verified by the community |
| **DistilBERT** | A lightweight, fine-tuned transformer model used for natural language-based place suggestions |
| **Decision Tree Classifier** | A machine learning model used for recommending the best transport mode |
| **Minimum Transaction Settlement** | A graph algorithm that reduces the number of transactions needed to settle group debts |

---
