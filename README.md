# 🌹 Lota Labs Games

**A modern full-stack platform for interactive fiction, storytelling, and creator engagement.**
Built with a **JavaScript/Next.js frontend** and a **TypeScript/Supabase backend**, Lota Labs Games is a complete ecosystem that blends a community hub, content management system, analytics, and notification engine into one sleek platform.

🔗 **Live Demo:** [LotaLabs](https://lotalabs.vercel.app/)
💻 Tech Stack: **Next.js (React)** · **Supabase (PostgreSQL)** · **TypeScript** (Edge Functions) · **Custom CSS** · **Tiptap** · **Resend**

---

## 🚀 Overview

Lota Labs Games serves as a **central platform for my interactive fiction projects**, providing players and readers with a space to engage, subscribe, comment, and receive updates.
It’s designed not just as a showcase, but as a **fully functional web app** that could scale to handle thousands of active users.

---

## 🧠 Core Features

### 🎮 User Features

* **Dynamic Blog & Projects:** Fully searchable and filterable sections for posts and projects.
* **Profile System:** Users can upload avatars, edit bios, and manage notification preferences.
* **Deep Commenting:** Nested comment and reply system with clean UI and markdown support.
* **Subscriptions & Notifications:** In-app and email alerts for post updates, replies, and announcements.
* **Newsletter System:** Users can opt in to receive “The Lab Report” — a platform-wide newsletter.

### ⚙️ Admin Dashboard

* **Role-Based Access Control (RBAC):** Secured at the database level with **Supabase RLS**. Only admins can access management features.
* **Content Management:** Create, edit, and delete posts, projects, and announcements.
* **File Manager:** Upload and organize media assets for posts and pages.
* **Newsletter Composer:** Write and send rich HTML newsletters directly from the dashboard.
* **Analytics Hub:** Track site metrics and social media growth (Instagram, TikTok, LinkedIn, etc.).

### 🔔 Advanced Systems

* **Automated Notification Engine:** PostgreSQL triggers and Edge Functions power instant in-app + email alerts.
* **Moderation System:** Users can report comments; admins can review and take action.
* **Dynamic SEO:** All content pages auto-generate `<meta>` tags for optimal search visibility.
* **Threaded Support Helpdesk:** A full ticket-messaging system allowing users and admins to have back-and-forth conversations, with automatic email/in-app notifications on reply.

---

## 🧰 Architecture & Stack

| Layer          | Technology             | Purpose                                                         |
| -------------- | --------------------   | ----------------------------------------------------------------|
| Frontend       | Next.js (App Router)   | UI (React), Server-Side SEO (generateMetadata), and Routing     |
| Styling        | Custom CSS (style.css) | All component styling, layouts, and custom @keyframe animations.|
| Backend & Auth | Supabase               | Database, RLS, Authentication, and Storage.                     |
| Database       | PostgreSQL             | Core data, SQL Functions (SECURITY DEFINER), and Triggers.      |
| Serverless     | Deno (TypeScript)      | Supabase Edge Functions for real-time email + event automation. |
| Email          | Resend API             | Transactional + newsletter emails                               |
| Editor         | Tiptap                 | Rich-text content creation                                      |

---

## 🌱 Future Enhancements

* Password recovery and OAuth login
* Like/upvote system for posts and comments
* Extended analytics and data visualization
* Tags system
* User reputation/badges
* Mobile app

---

## 📸 Screenshots

<img width="2522" height="1416" alt="07 11 2025_00 57 37_REC" src="https://github.com/user-attachments/assets/44bbf148-4203-4193-be44-7ab55ab38f92" />

<img width="2560" height="1422" alt="07 11 2025_00 58 56_REC" src="https://github.com/user-attachments/assets/86299aa7-e029-4088-b908-445b79fe81e1" />

<img width="2560" height="1418" alt="07 11 2025_01 00 05_REC" src="https://github.com/user-attachments/assets/dbdd53b7-5f92-432c-a029-2cc6c3fefed5" />

---

## 👨🏽‍💻 About the Developer

I’m **Lotanna**, a passionate **full-stack developer and interactive fiction creator**.
I specialize in building clean, scalable web applications using modern technologies like **React, TypeScript, Next.js, and Supabase**.
This project is part of my larger goal to merge **storytelling and technology.** I want to turn narrative experiences into living, interactive worlds.

---

## 🪪 License

This project is open-source under the MIT License.
