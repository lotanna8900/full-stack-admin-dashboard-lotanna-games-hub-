# 🌹 Lota Labs

**Where Narrative Meets the Blockchain.**
The first "Story-to-Chain" platform that turns interactive fiction readers into digital owners.

🔗 **Live Demo:** https:lotalabs.vercel.app
---

## 🚀 Overview

**Lota Labs** is a vertically integrated platform for On-Chain Interactive Fiction. Unlike standard web games, Lota Labs features a custom-built **Narrative Engine** that parses `ink` scripts (standard interactive fiction files) and translates narrative choices into blockchain events.

It serves two purposes:
1.  **For Readers:** A seamless reading experience where choices (weapons, alliances, endings) are permanently attested on-chain via wallet signatures.
2.  **For Creators:** A full-stack hub with CMS, analytics, and newsletters to build a community around their stories.

---

## 💎 The "Story-to-Chain" Engine

This is the core innovation of the project. I reverse-engineered the standard Ink runtime to create a React-based interpreter that supports **On-Chain Triggers**.

### How it works:
1.  **Scripting:** Authors write standard Ink stories with custom tags (e.g., `# mint: weapon_greatsword`).
2.  **Parsing:** The React Engine parses the text and detects the tag in real-time.
3.  **Execution:** The engine pauses the story, triggers **Wagmi/Viem** hooks, and prompts the user's wallet (MetaMask/Trust Wallet) to sign the transaction.
4.  **Result:** The narrative continues only after the blockchain event is acknowledged.

---

## 🛠 Tech Stack

### **Web3 & Game Logic** (New)
* **Engine:** Custom React Interpreter (built on `inkjs`)
* **Blockchain:** Wagmi, Viem
* **Network:** BNB Smart Chain (Testnet), Ethereum Compatible
* **Wallets:** Injected Connectors (MetaMask, Trust Wallet)

### **Core Full-Stack**
* **Frontend:** Next.js 15 (App Router, Server Actions)
* **Backend:** Supabase (PostgreSQL, Row Level Security)
* **Language:** TypeScript (Strict typing for game state & Web3 hooks)
* **Styling:** Tailwind CSS (Mobile-first responsive grids) + Custom CSS Animations

### **Infrastructure**
* **Edge Functions:** Deno (TypeScript) for notifications & triggers
* **Email:** Resend API (Newsletter & Transactional)
* **Editor:** Tiptap (Rich text CMS)

---

## 🧠 Key Features

### 🎮 The Game Player
* **Wallet Integration:** Seamless connect/disconnect logic with network detection.
* **Visual Novel Support:** Engine supports inline image rendering via `# image:` tags.
* **Responsive UI:** Optimized explicitly for mobile readers (Stacked Stats view) vs Desktop (Side-by-Side view).
* **State Tracking:** Tracks RPG stats (Health, Mana, Inventory) in React state, synchronized with the narrative flow.

### 🏛 The Community Hub (CMS)
* **Dynamic Blog:** Searchable content hub for lore and updates.
* **Profile System:** User avatars, bios, and reputation tracking.
* **Nested Comments:** Deep threading for community theory-crafting.
* **Notification Engine:** Real-time alerts via Supabase Realtime & Edge Functions.

### ⚙️ Admin Dashboard
* **RBAC:** Strict Role-Based Access Control (Admins vs. Users).
* **Content Manager:** Create/Edit posts and Game Snippets directly in the browser.
* **Newsletter Composer:** HTML-rich email builder integrated with the user database.
* **Analytics:** Tracking user engagement and story retention rates.

---

## 🧰 Architecture Overview

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Game Layer** | InkJS + React | Parses story files `.json` and manages narrative state. |
| **Web3 Layer** | Wagmi / Viem | Handles wallet connection, signing, and chain switching. |
| **Data Layer** | Supabase (Postgres) | Stores user profiles, comments, and non-chain game saves. |
| **Edge Layer** | Supabase Functions | Handles secure email dispatch and complex triggers. |
| **UI Layer** | Next.js / Tailwind | Server-side rendering for SEO; Client-side for Game interactivity. |

---

## 📸 Screenshots

<img width="2490" height="1340" alt="05 01 2026_16 09 25_REC" src="https://github.com/user-attachments/assets/ca88b799-7339-4db7-880a-b9a167b1d1d2" />

<img width="2502" height="1352" alt="05 01 2026_16 12 16_REC" src="https://github.com/user-attachments/assets/669b5aa3-457e-49a8-b63a-f1e5c368af3c" />

![IMG_6382](https://github.com/user-attachments/assets/b853410f-ba35-4d94-8c79-6d2271973bdd)

---

## 👨🏽‍💻 About the Developer

**Lotanna**
*Author. Analyst. Builder.*

I am a Full-Stack Developer and Published Interactive Fiction Author ("Keeper's Vigil", Hosted Games).
My background bridges the gap between **Narrative Design** and **Technical Engineering**.

* **Skills:** TypeScript, Next.js, Solidity/Web3 Integration, Data Analysis.
* **Mission:** To solve the "Ownership Gap" in interactive media by building tools that let readers own their journey.

---

## 🪪 License

This project is open-source under the MIT License.
